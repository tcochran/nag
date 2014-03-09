require 'sinatra'
require "sinatra/cookies"
require 'rubygems'
require 'mongo'
require 'json'
require 'uri'
require_relative "app/date_parser"
require_relative "app/nag_mongo"
set :session_secret, ENV['NAG_SESSION_SECRET']

enable :sessions

include Mongo

require "base64"
require 'json'

require 'cgi'
require 'openssl'

set :public_folder, File.dirname(__FILE__) + '/static'
set :static_cache_control, [:public, max_age: 60 * 60 * 24 * 365]

def get_connection
  return @db_connection if @db_connection
  db = URI.parse(ENV['MONGOHQ_URL'])
  db_name = db.path.gsub(/^\//, '')
  @db_connection = Mongo::Connection.new(db.host, db.port).db(db_name)
  @db_connection.authenticate(db.user, db.password) unless (db.user.nil? || db.user.nil?)
  @db_connection
end

before do 
    db = settings.environment == :development ? MongoClient.new().db("nag") : get_connection
    @nag_collection = db["nags"]
    @nag_mongo = NagMongoClient.new(settings.environment)
end

get '/' do
    send_file File.join(settings.public_folder, 'templates/nag.html')
end

def base64_url_decode(str)
   str += '=' * (4 - str.length.modulo(4))
   Base64.decode64(str.tr('-_','+/'))
 end

FACEBOOK_SECRET = ENV['NAG_FACEBOOK_SECRET']

def validate_request
  if ENV['NAG_ENV'] == 'dev'
    @user_id = 'joebloggs'
    return true
  end

  sr_key = cookies.keys.detect {|key| key =~ /^fbsr/ }
  first, second = cookies[sr_key].split(".")
  sig = base64_url_decode(first)
  @data = JSON.parse base64_url_decode(second)
  @user_id = @data['user_id']

  expected_sig = OpenSSL::HMAC.digest('sha256',FACEBOOK_SECRET, second)
  if sig != expected_sig
    raise "FACEBOOK REQUEST WAS NOT VALID"
  end
end

def validate_admin_request
  validate_request

  if (@nag_mongo.find_user(@user_id)['admin'] != true)
    raise "FACEBOOK REQUEST WAS NOT VALID"
  end
end

get '/tasks' do 
    validate_request
    if params[:deadline] 
      date = Time.parse(params[:deadline])
    else
      date = nil
    end
    content_type 'application/json'
    @nag_mongo.nags(@user_id, {deadline: date}).to_json
end

get '/tasks/expired' do 
    validate_request
    content_type 'application/json'
    @nag_mongo.nags(@user_id).to_json
end

post '/tasks' do 
    validate_request
    data = JSON.parse request.body.read
    data["deadline_date"] = DateParser.new.parse data["deadline"] 
    data["id"] = @nag_mongo.next_task_id
    data["finished"] = false;
    data["deleted"] = false;
    data["user_id"] = @user_id
    @nag_collection.insert(data)
end

post '/logon' do
  validate_request
  data = JSON.parse request.body.read
  @nag_mongo.logon(@user_id, data)
  {}
end

get '/users' do
  validate_admin_request
  content_type 'application/json'
  @nag_mongo.users().to_json
end

delete '/tasks/:id' do |id|
    validate_request
    @nag_collection.update({id: id.to_i, user_id: @user_id}, {deleted: true})
end

post '/tasks/:id' do |id|
    validate_request
    data = JSON.parse request.body.read
    data.delete('_id')
    data['deadline_date'] = Time.parse(data['deadline_date'])
    @nag_collection.update({id: id.to_i, user_id: @user_id}, data)
    ""
end

get '/tasks/:id' do |id|
    validate_request
    @nag_collection.find_one('id' => id.to_i, user_id: @user_id).to_json
end
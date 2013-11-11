require 'sinatra'
require 'rubygems'
require 'mongo'
require 'json'
require 'uri'
require_relative "app/date_parser"
require_relative "app/nag_mongo"

include Mongo

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

get '/tasks' do 
    if params[:deadline] 
      date = Time.parse(params[:deadline])
    else
      date = nil
    end
    content_type 'application/json'
    @nag_mongo.nags({deadline: date}).to_json
end

get '/tasks/expired' do 
    content_type 'application/json'
    @nag_mongo.nags.to_json
end

post '/tasks' do 
    data = JSON.parse request.body.read
    data["deadline_date"] = DateParser.new.parse data["deadline"] 
    data["id"] = @nag_mongo.next_task_id
    data["finished"] = false;
    data["deleted"] = false;
    @nag_collection.insert(data)
end


delete '/tasks/:id' do |id|
    @nag_collection.update({id: id.to_i}, {deleted: true})
end

post '/tasks/:id' do |id|
    data = JSON.parse request.body.read
    data.delete('_id')
    data['deadline_date'] = Time.parse(data['deadline_date'])
    puts data
    @nag_collection.update({id: id.to_i}, data)
    ""
end

get '/tasks/:id' do |id|
    @nag_collection.find_one('id' => id.to_i).to_json
end
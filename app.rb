require 'sinatra'
require 'rubygems'
require 'mongo'
require 'json'
require_relative "app/date_parser"

include Mongo

set :public_folder, File.dirname(__FILE__) + '/static'
set :static_cache_control, [:public, max_age: 60 * 60 * 24 * 365]

before do 
    db = MongoClient.new().db("nag")
    @nag_collection = db["nags"]
end

get '/' do
    send_file File.join(settings.public_folder, 'templates/nag.html')
end

get '/tasks' do 
    content_type 'application/json'
    @nag_collection.find().to_a.to_json
end

post '/tasks' do 
    data = JSON.parse request.body.read
    p data
    data["deadline_date"] = DateParser.new.parse data["deadline"] 
    @nag_collection.insert(data)
end
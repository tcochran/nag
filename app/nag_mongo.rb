require 'mongo'
require 'sinatra'


class NagMongoClient

    include Mongo
    def initialize(env)
        @db = env == :development ? MongoClient.new().db("nag") : get_connection

        def get_connection
          p "USING MONGOHQ"
          return @db_connection if @db_connection
          db = URI.parse(ENV['MONGOHQ_URL'])
          db_name = db.path.gsub(/^\//, '')
          @db_connection = Mongo::Connection.new(db.host, db.port).db(db_name)
          @db_connection.authenticate(db.user, db.password) unless (db.user.nil? || db.user.nil?)
          @db_connection
        end

    end

    def nags
        @db['nags']
    end

    def init 
        @db['nags'].remove
        @db['counters'].remove
        @db['counters'].insert(
       {
          _id: "taskId",
          seq: 0
       })
    end

    def next_task_id
        result = @db['counters'].find_and_modify(
            {
                query: { _id: 'taskId' },
                update: { '$inc' =>  { seq: 1 } },
                'new' => true
            }
        );
        result['seq']
    end
end
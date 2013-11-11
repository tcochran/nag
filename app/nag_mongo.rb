require 'mongo'
require 'sinatra'


class NagMongoClient

    include Mongo
    
    def initialize(env)
        if env == :development
          @db = MongoClient.new().db("nag")
        elsif env == :test
          @db = MongoClient.new().db("nag_test")
        else
          @db = get_connection
        end

        def get_connection
          p "USING MONGOHQ"
          return @db_connection if @db_connection
          db = URI.parse(ENV['MONGOHQ_URL'])
          db_name = db.path.gsub(/^\//, '')
          @db_connection = Mongo::Connection.new(db.host, db.port).db(db_name)
          @db_connection.authenticate(db.user, db.password) unless (db.user.nil? || db.user.nil?)
          @db_connection
        end


        if @db['counters'].find('_id' => 'taskId').count() == 0
          @db['counters'].insert({'_id' => 'taskId', seq: 0})
        end
    end

    def nags(query)
        if (query[:deadline])
          puts query[:deadline].utc()
          @db['nags'].find({deleted: false, "deadline_date" => {"$lt" => query[:deadline].utc} }, :sort => {'deadline_date' => -1}).to_a
        else 
          @db['nags'].find({deleted: false}, :sort => {'deadline_date' => -1}).to_a
        end
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

    def col
      @db['nags']
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
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

        # move into init db script
        if @db['counters'].find('_id' => 'taskId').count() == 0
          @db['counters'].insert({'_id' => 'taskId', seq: 0})
        end
    end

    def nags(user_id, query)
        if (query[:deadline])
          puts query[:deadline].utc()
          @db['nags'].find({user_id: user_id, deleted: false, "deadline_date" => {"$lt" => query[:deadline].utc} }, :sort => {'deadline_date' => -1}).to_a
        else 
          @db['nags'].find({user_id: user_id, deleted: false}, :sort => {'deadline_date' => -1}).to_a
        end
    end

    def logon(user_id, params)

      if (@db['users'].find_one({user_id: user_id}) == nil)
        @db['users'].insert({user_id: user_id, facebook_user: params, last_logon: Time.now, toggles: [], admin: false})  
      end

      @db['users'].update({user_id: user_id}, {'$set' => { last_logon: Time.now }} )
    end

    def users()
      @db['users'].find().to_a
    end

    def find_user(user_id)
      @db['users'].find_one({user_id: user_id})
    end

    def init 
        @db['nags'].remove
        @db['counters'].remove
        @db['users'].remove
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
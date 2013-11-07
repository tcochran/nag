require_relative "../app/nag_mongo"

describe DateParser, "mongo" do
  
    it "sort by deadline date" do
        mongo_client = NagMongoClient.new(:test)
        mongo_client.col.remove()
        mongo_client.col.insert({deadline_date: Time.new(2012, 1, 1, 0, 0, 1), :deleted => false })

        mongo_client.nags({}).count().should == 1
        mongo_client.nags({deadline: Time.new(2012, 1, 1, 0, 0, 1).utc()}).count().should == 0
        mongo_client.nags({deadline: Time.new(2012, 1, 1, 0, 0, 2).utc()}).count().should == 1

    end

end
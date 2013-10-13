require 'em-websocket'
require 'mongo'
require_relative "app/nag_mongo"

require "observer"


class Tasks
   include Observable


  def run
    loop do
      overdue_nags = NagMongoClient.new(:development).nags.find({ deadline_date: { '$lte' =>  Time.now.utc } })

      if (overdue_nags.count() > 0)
        changed
        notify_observers(overdue_nags.to_a)
      end
      
      sleep 10
    end
  end
end

tasks = Tasks.new
Thread.new { tasks.run }

class TaskObserver 

  def initialize(ws)
    @ws = ws
  end

  def update(nags)
    print "recived event"
    @ws.send("nag");
  end
end


EM.run {
  EM::WebSocket.run(:host => "0.0.0.0", :port => 4444) do |ws|
    ws.onopen { |handshake|
      tasks.add_observer(TaskObserver.new(ws))
    }
  end
}
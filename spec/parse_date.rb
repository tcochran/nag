require_relative "../app/date_parser"

describe DateParser, "#score" do
  it "calculates friday to be next friday at 10 am" do
    monday = Date.new(2013, 9, 30) # monday 
    tuesday = Date.new(2013, 10, 1) # monday 
    wednesday = Date.new(2013, 10, 2) # monday 
    thursday = Date.new(2013, 10, 3) # monday 
    friday = Date.new(2013, 10, 4) # monday 
    saturday = Date.new(2013, 10, 5) # monday 
    sunday = Date.new(2013, 10, 6) # monday 
    next_monday = Date.new(2013, 10, 7) # monday 

    DateParser.new(monday).parse("friday").should == friday
    DateParser.new(monday).parse("TuesDay").should == tuesday
    DateParser.new(monday).parse("wednesday").should == wednesday
    DateParser.new(monday).parse("thursday").should == thursday
    DateParser.new(monday).parse("friday").should == friday
    DateParser.new(monday).parse("saturday").should == saturday
    DateParser.new(monday).parse("sunday").should == sunday
    DateParser.new(monday).parse("Monday").should == next_monday
  end
end
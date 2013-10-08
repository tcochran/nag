require_relative "../app/date_parser"

describe DateParser, "#score" do
  
  it "calculates friday to be next friday at 10 am" do
    monday = Date.new(2013, 9, 30)
    tuesday = Date.new(2013, 10, 1)
    wednesday = Date.new(2013, 10, 2)
    thursday = Date.new(2013, 10, 3)
    friday = Date.new(2013, 10, 4)
    saturday = Date.new(2013, 10, 5)
    sunday = Date.new(2013, 10, 6)
    next_monday = Date.new(2013, 10, 7)  

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
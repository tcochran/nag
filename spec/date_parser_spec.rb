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

        DateParser.new(monday).parse("friday").should == friday.to_time
        DateParser.new(monday).parse("TuesDay").should == tuesday.to_time
        DateParser.new(monday).parse("wednesday").should == wednesday.to_time
        DateParser.new(monday).parse("thursday").should == thursday.to_time
        DateParser.new(monday).parse("friday").should == friday.to_time
        DateParser.new(monday).parse("saturday").should == saturday.to_time
        DateParser.new(monday).parse("sunday").should == sunday.to_time
        DateParser.new(monday).parse("Monday").should == next_monday.to_time
    end

    it "calculates time in some minutes" do
        test_date = Time.new(2013, 9, 30)
        DateParser.new(test_date).parse("in 1 minute").should == Time.new(2013, 9, 30, 0,  1)
        DateParser.new(test_date).parse("in 2 Minutes").should == Time.new(2013, 9, 30, 0,  2)
        DateParser.new(test_date).parse("in 999 minuteS").should == Time.new(2013, 9, 30, 16, 39)
        DateParser.new(test_date).parse("in 1000 minutes").should be_nil
    end

    it "calculates date from now" do
        test_date = Time.new(2013, 9, 20)
        DateParser.new(test_date).parse("2 days from now").should == Time.new(2013, 9, 22)
        DateParser.new(test_date).parse("1 day from now").should == Time.new(2013, 9, 21)
        DateParser.new(test_date).parse("999 days from now").should == Time.new(2016, 6, 15)
        DateParser.new(test_date).parse("1000 days from now").should be_nil 
    end

    it "calculates from phrases" do
        test_date = Time.new(2013, 9, 20)
        DateParser.new(test_date).parse("next week").should == Time.new(2013, 9, 27)
        DateParser.new(test_date).parse("next month").should == Time.new(2013, 10, 20)
        DateParser.new(test_date).parse("tomorrow").should == Time.new(2013, 9, 21)
    end

end
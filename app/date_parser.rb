require 'active_support/core_ext/date/calculations'
require 'active_support/core_ext/time/calculations'

class DateParser 

    def initialize(current_date = Time.now)
        @current_date = current_date
    end

    def parse text 
        text = text.downcase
        date = parse_day_of_week(text)
        date = parse_in_minutes(text) if date == nil
        date = parse_days_from_now(text) if date == nil
        date = parse_phrases(text) if date == nil
        date
    end

    def parse_day_of_week text
        if ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].include? text
            days_ahead = (1..7).find { |num|  @current_date.advance(days: num).strftime('%A').downcase() == text }
            return @current_date.advance(days: days_ahead).to_time  
        end
        nil
    end

    def parse_in_minutes text
        if match = /in (\d) minute/.match(text) 
            return @current_date.advance(minutes: match[1].to_i)    
        end

        if match = /in (\d\d?\d?) minutes/.match(text) 
            return @current_date.advance(minutes: match[1].to_i)
        end
        nil
    end

    def parse_days_from_now text
        if match = /^(\d) day from now$/.match(text)
            return @current_date.advance(days: match[1].to_i).to_time
        end

        if match = /^(\d\d?\d?) days from now$/.match(text) 
            return @current_date.advance(days: match[1].to_i).to_time 
        end
        nil
    end

    def parse_phrases text 
        if match = /^next week$/.match(text)
            return @current_date.advance(weeks: 1).to_time
        end

        if match = /^next month$/.match(text)
            return @current_date.advance(months: 1).to_time
        end

        if match = /^tomorrow$/.match(text)
            return @current_date.advance(days: 1).to_time
        end
        nil
    end

end
require 'active_support/core_ext/date/calculations'

class DateParser 

    def initialize(current_date = Date.today)
        @current_date = current_date
    end

    def parse(text) 
        parse_day_of_week(text.downcase)
    end

    def parse_day_of_week text
        if ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].include? text
            days_ahead = (1..7).find { |num|  @current_date.advance(days: num).strftime('%A').downcase() == text }
            return @current_date.advance(days: days_ahead).to_time  
        end
        nil
    end

end
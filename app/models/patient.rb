class Patient < ApplicationRecord
    def self.search(search)
        where("lastname LIKE ?", "%#{search}%")
    end
    
    belongs_to :user
    
    
end

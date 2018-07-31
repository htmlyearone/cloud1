class Illness
    def self.runcheck(sickness)
        if sickness == 1
            ans = "none of very minor patient, wait time - 2 hours "
        elsif (sickness == 2)
            ans = "moderate or less important, wait time - 1 hour"
        elsif (sickness == 3)
            ans = "possibly major, could require referral, wait time - >20 minutes"
        elsif (sickness == 4)
            ans = "major injury, send directly to hosipital with referral note"
        elsif (sickness == 5)
            ans = "call ambulance for patient, life changing injuries"
        end
    return ans
    end
end # End Module
end

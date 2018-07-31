class DeferPdf < Prawn::Document
    def initialize(patient)
        super(top_margin: 70)
        @patient = patient
        patient_defer
      
     
    end
    def patient_defer
           text "Patient deferall letter", size: 30, style: :bold
           move_down 50
           text "Patient id: #{@patient.id}"
           text "name: #{@patient.firstname}#{ @patient.lastname}"
           text "Contact number: #{@patient.phoneno}"
           text "infection: #{@patient.infection}"
           text "injury: #{@patient.injury}"
           text"prescribed medication: #{@patient.prescribe}"
           text"referal for: #{@patient.note}"
       end
     
   
      


     

     
  
end

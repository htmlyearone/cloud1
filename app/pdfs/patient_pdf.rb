class PatientPdf < Prawn::Document
    def initialize(patient)
        super(top_margin: 70)
        @patient = patient
        patient_info
      
     
    end
    def patient_info
           text "Patient prescribtion", size: 30, style: :bold
           move_down 50
           text "Patient id: #{@patient.id}"
           text "name: #{@patient.firstname}#{ @patient.lastname}"
           text "Contact number: #{@patient.phoneno}"
           text "infection: #{@patient.infection}"
           text "injury: #{@patient.injury}"
           text"patient prescription: #{@patient.prescribe}"
       end
     
   
      


     

     
  
end

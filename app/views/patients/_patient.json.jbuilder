json.extract! patient, :id, :firstname, :lastname, :address, :dob, :phoneno, :infection, :injury, :created_at, :updated_at
json.url patient_url(patient, format: :json)

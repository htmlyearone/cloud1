class PatientsController < ApplicationController
  before_action :set_patient, only: [:show, :edit, :update, :destroy, :referral]

  # GET /patients
  # GET /patients.json
 

  
  def index
    @patients = Patient.all
    if params[:search]
      @patients = Patient.search(params[:search]).order("created_at DESC")
    else
      @patients = Patient.all.order('created_at DESC')
    end
  end

  # GET /patients/1
  # GET /patients/1.json
  def show
respond_to do |format|
    format.html
    format.json
    format.pdf do
      pdf = PatientPdf.new(@patient)
      send_data pdf.render,
     type: "application/pdf",
      disposition: "attachment"
  
  
    end
  end
  end

  # GET /patients/new
  def new
    @patient = current_user.patients.build
  end

  # GET /patients/1/edit
  def edit
  end

  # POST /patients
  # POST /patients.json
  def create
    @patient = current_user.patients.build(patient_params)

    respond_to do |format|
      if @patient.save
        format.html { redirect_to @patient, notice: 'Patient was successfully created.' }
        format.json { render :show, status: :created, location: @patient }
      else
        format.html { render :new }
        format.json { render json: @patient.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /patients/1
  # PATCH/PUT /patients/1.json
  def update
    respond_to do |format|
      if @patient.update(patient_params)
        format.html { redirect_to @patient, notice: 'Patient was successfully updated.' }
        format.json { render :show, status: :ok, location: @patient }
      else
        format.html { render :edit }
        format.json { render json: @patient.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /patients/1
  # DELETE /patients/1.json
  def destroy
    @patient.destroy
    respond_to do |format|
      format.html { redirect_to patients_url, notice: 'Patient was successfully destroyed.' }
      format.json { head :no_content }
    end
  end
  
  def check
     @input1 = params[:search_string]
     @result = Illness.runcheck(@input1.to_i)
  end

  
  private
    # Use callbacks to share common setup or constraints between actions.
    def set_patient
      @patient = Patient.find(params[:id])
    end
  #Method to get the prcice for custom gem
  
    # Never trust parameters from the scary internet, only allow the white list through.
    def patient_params
      params.require(:patient).permit(:firstname, :lastname, :address, :dob, :phoneno, :infection, :injury, :prescribe, :note )
    end
end

 
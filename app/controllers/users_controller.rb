class UsersController < ApplicationController
  
  def index
    @users = User.all

    respond_to do |format|
      format.html
      format.csv { send_data @users.to_csv, filename: "users-#{Date.today}.csv" }
    end
  end
  
  def show
    @user = User.find(params[:id])
    @user_patients = @user.patients
    

  end
end

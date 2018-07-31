class AddPrescribeToPatients < ActiveRecord::Migration[5.1]
  def change
    add_column :patients, :prescribe, :string
  end
end

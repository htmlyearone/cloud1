class CreatePatients < ActiveRecord::Migration[5.1]
  def change
    create_table :patients do |t|
      t.string :firstname
      t.string :lastname
      t.string :address
      t.string :dob
      t.integer :phoneno
      t.string :infection
      t.string :injury

      t.timestamps
    end
  end
end

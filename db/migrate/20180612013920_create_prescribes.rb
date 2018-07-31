class CreatePrescribes < ActiveRecord::Migration[5.1]
  def change
    create_table :prescribes do |t|
      t.string :name
      t.string :drug
      t.text :notes

      t.timestamps
    end
  end
end

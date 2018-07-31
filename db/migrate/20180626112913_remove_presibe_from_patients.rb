class RemovePresibeFromPatients < ActiveRecord::Migration[5.1]
  def change
    remove_column :patients, :prescribe, :string
  end
end

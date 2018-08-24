class AddServerNameToUser < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :server_name, :string
  end
end

class CreateUsers < ActiveRecord::Migration[5.2]
  def change
    create_table :users do |t|
      t.string :name
      t.string :email
      t.string :cas_user
      t.string :roles

      t.timestamps
    end
  end
end

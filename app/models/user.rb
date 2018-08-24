class User < ApplicationRecord
  
  def self.available_servers
    {
      "TAO Dashboard" => "http://localhost:3001/tao/",
      "DEMS" => "http://localhost:3001/tao/"
    }
  end

  def current_server_url
    User.available_servers[server_name]
  end
end

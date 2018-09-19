class User < ApplicationRecord
  
  def self.available_servers
    {
      "TAO Dashboard" => (Rails.env.development? ? "http://ocpwebtest.ocp.ucdavis.edu/rest/tao/attendance/" : "https://ocpweb.ucdavis.edu/rest/tao/attendance/")
    }
  end

  def current_server_url
    User.available_servers[server_name]
  end
end

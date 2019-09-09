class User < ApplicationRecord

  def self.available_servers
    servers = {
      "TAO Dashboard" => (Rails.env.development? ? "http://ocpwebtest.ocp.ucdavis.edu/rest/tao-1/attendance/" : "https://ocpweb.ucdavis.edu/rest/tao-1/attendance/")
    }

    if Rails.env.development?
      servers["Development Server"] = "http://localhost:3001/"
    end

    servers
  end

  def current_server_url
    User.available_servers[server_name]
  end
end

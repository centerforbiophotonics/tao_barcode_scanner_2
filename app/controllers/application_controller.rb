class ApplicationController < ActionController::Base
	#protect_from_forgery with: :null_session
	before_action RubyCAS::Filter, :if => -> { Rails.env.production? }
  before_action :dev_cas_user, :if => -> { Rails.env.development? }
  before_action :check_for_existing_user_else_redirect

  helper_method :current_user
  helper_method :url

  def dev_cas_user
    unless User.where(:cas_user => "dev_user").exists?
       User.create(:cas_user => "dev_user", :name => "dev_user")
    end
    
    session[:cas_user] = "dev_user"
  end

  def current_user
    User.find_by(:cas_user => session[:cas_user])
  end

  def check_for_existing_user_else_redirect
    if current_user.nil?
      no_access
    end
  end

  def no_access
    respond_to do |format|
      format.html { render file: "#{Rails.root}/public/401", layout: false, status: :error }
      format.json { render json: {error: "Not Authorized"}, status: :error }
      format.xml { head :not_found }
      format.any { head :not_found }
    end
  end

  def url
    root_url(:protocol => (Rails.env == "production" ? 'https' : 'http'))
  end
end

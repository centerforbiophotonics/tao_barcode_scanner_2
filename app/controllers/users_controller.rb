class UsersController < ApplicationController
	skip_before_action :verify_authenticity_token, :only => [:add, :delete, :update]

	def user
		@users = User.all
	end

	def add
		u = User.new
		u.name = params[:name]
		u.email = params[:email]
		u.role = params[:role]
		u.cas_user = params[:id]
		u.save!

		render :json => User.all
	end

	def update
		if User.exists?(:id => params[:id])
			u = User.find_by(:id => params[:id])
			if !params[:name].blank? 
				u.name = params[:name]
			end
			if !params[:email].blank? 
				u.email = params[:email]
			end
			if !params[:role].blank? 
				u.role = params[:role]
			end
			u.save!
			puts "User #{u.name}, ID #{u.cas_user} updated."
		end
		render :json => User.all
	end

	def delete
		if User.exists?(:id => params[:id])
			u = User.find_by(:id => params[:id])
			puts "User #{u.name}, ID #{u.cas_user} destroyed."
			u.destroy
		end
		render :json => User.all
	end
end
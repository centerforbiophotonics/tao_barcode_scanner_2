class UsersController < ApplicationController

	def user
		puts "hello"
		@users = User.all
	end

	def add_user
	end

end
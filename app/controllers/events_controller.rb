class EventsController < ApplicationController
  require_relative '../../lib/convert_to_pdf.rb'
  include ConvertToPdf

  def home
    @servers = User.available_servers.keys
  end

  def scanner
  end

  def workshops
  	#replace with actual server URL

    workshops = HTTParty.get(current_user.current_server_url+"workshops", format: :plain)
    render :json => workshops.body
  end

  def attend
  	#replace with actual server URL
  	r = HTTParty.post(current_user.current_server_url+"attend", 
  		body: {:attendee_id => event_params[:attendee_id], :workshop_id => event_params[:workshop_id]})

  	unless (r.code == 200) 
  		render :json => {status: "failure"}, :status => r.code
  	else 
    	render :json => {status: "success"}
    end
  end

  def print
  end

  def generate_pdf
    if (params[:workshop_id])
  		send_data generate_bulk_registrants(params[:workshop_id], params[:all]), :disposition => "attachment"
  	else
	  	send_data generate_registrants(params[:attendee_id], params[:attendee_name]), :disposition => "attachment"
	  end
  end

  private

  def event_params
  	params.require(:data).permit(:workshop_id, :attendee_id)
  end

end

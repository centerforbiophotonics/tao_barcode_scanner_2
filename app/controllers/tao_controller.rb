class TaoController < ApplicationController
  skip_before_action :verify_authenticity_token, :only => [:attend, :generate_pdf]
  require_relative '../../lib/convert_to_pdf.rb'
  include ConvertToPdf
  def app
  end

  def workshops
  	#replace with actual server URL
	workshops = HTTParty.get("http://localhost:3001/tao/workshops", format: :plain)
	puts(workshops)
	render :json => workshops.body
  end

  def attend
  	puts(params)
  	puts(tao_params)
  	#replace with actual server URL
  	r = HTTParty.post("http://localhost:3001/tao/attend", 
  		body: {:attendee_id => tao_params[:attendee_id], :workshop_id => tao_params[:workshop_id]})
  	puts('####')
  	puts(tao_params)
  	puts(r.code)
  	unless (r.code == 200) 
  		render :json => {status: "failure"}, :status => r.code
  	else 
    	render :json => {status: "success"}
    end
  end

  def print
  end

  def generate_pdf
  	send_data generate_registrants(params[:attendee_id], params[:attendee_name]), :disposition => "attachment; filename=badge.pdf"
  end

  private
  def tao_params
  	params.require(:data).permit(:workshop_id, :attendee_id)
  end

end

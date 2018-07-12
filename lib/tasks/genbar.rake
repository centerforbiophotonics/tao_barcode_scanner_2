namespace :genbar do
  desc "This task will generate a printable PDF with two columns of barcodes for testing."
  task multi: :environment do
  	require 'barby'
    require 'barby/barcode/code_128'
    require 'barby/outputter/png_outputter'
    require 'chunky_png'
    require 'pdfkit'

  	workshops = HTTParty.get("http://localhost:3001/tao/workshops", format: :plain)

	nameslist = []
	barcodes = []
	pngs = []

	JSON.parse(workshops).each do |line|
		line['registrants'].each do |r|
			nameslist.push r["name"]
			barcodes.push Barby::Code128.new(r["id"])
			pngs.push Barby::PngOutputter.new(barcodes.last).to_image.to_data_url
		end
	end

	set = nameslist.zip pngs
    html = ApplicationController.render(file: Rails.root.join('app/views/tao/multi_badge_template.html.erb'), assigns: {set: set})
    kit = PDFKit.new(html, :margin_top => 0, :margin_bottom => 0, :margin_left => 0, :margin_right => 0, dpi: 400)

    File.open("testpage.pdf", "wb+") {|f| f.write(kit.to_pdf) }
  end

end

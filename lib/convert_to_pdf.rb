module ConvertToPdf
  require 'barby'
  require 'barby/barcode/code_128'
  require 'barby/outputter/png_outputter'
  require 'chunky_png'
  require 'pdfkit'
 
  def generate_registrants(id, name)
    barcode = Barby::Code128.new(id)
    png = Barby::PngOutputter.new(barcode).to_image.to_data_url
    html = ApplicationController.render(file: Rails.root.join('app/views/tao/template.html.erb'), assigns: {path: Rails.root.join("lib") , name: name, png: png })
    kit = PDFKit.new(html, :page_height => 76.2, :page_width => 101.6, :margin_top => 0, :margin_bottom => 0, :margin_left => 0, :margin_right => 0,
     dpi: 400)

    kit.to_pdf
  end

  def generate_bulk_registrants(workshop_id, all)
    workshops = HTTParty.get("http://localhost:3001/tao/workshops", format: :plain)
    selected_workshop = {}

    JSON.parse(workshops).each do |w|
      if w["id"] == workshop_id
        selected_workshop = w
      end
    end

    nameslist = []
    barcodes = []
    pngs = []

    if all == true 
    #collect registrants from all workshops
      JSON.parse(workshops).each do |line|
        line['registrants'].each do |r|
          nameslist.push r["name"]
          barcodes.push Barby::Code128.new(r["id"])
          pngs.push Barby::PngOutputter.new(barcodes.last).to_image.to_data_url
        end
      end
    else
      selected_workshop["registrants"].each do |r|
          nameslist.push r["name"]
          barcodes.push Barby::Code128.new(r["id"])
          pngs.push Barby::PngOutputter.new(barcodes.last).to_image.to_data_url
      end
    end

    set = nameslist.zip pngs
    html = ApplicationController.render(file: Rails.root.join('app/views/tao/multi_badge_template.html.erb'), assigns: {set: set})
    kit = PDFKit.new(html, :margin_top => 0, :margin_bottom => 0, :margin_left => 0, :margin_right => 0, dpi: 400)
    kit.to_pdf
  end

end


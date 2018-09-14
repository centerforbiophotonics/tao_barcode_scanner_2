module ConvertToPdf
  require 'barby'
  require 'barby/barcode/code_128'
  require 'barby/outputter/png_outputter'
  require 'chunky_png'
  require 'pdfkit'
 
  def generate_registrants(id, name)
    barcode = Barby::Code128.new(id)
    png = Barby::PngOutputter.new(barcode).to_image.to_data_url
    html = ApplicationController.render(file: Rails.root.join('app/views/events/template.html.erb'), assigns: {path: Rails.root.join("lib") , name: name, png: png })
    kit = PDFKit.new(html, :page_height => 76.2, :page_width => 101.6, :margin_top => 0, :margin_bottom => 0, :margin_left => 0, :margin_right => 0,
     dpi: 400)

    kit.to_pdf
  end

  def generate_bulk_registrants(workshop_id, all,format)
    if all
      workshops = JSON.parse(HTTParty.get(current_user.current_server_url+"workshops", format: :plain))
    else
      workshops = JSON.parse(HTTParty.get(current_user.current_server_url+"workshops/#{workshop_id}", format: :plain))
    end
    
    nameslist = []
    barcodes = []
    pngs = []

    if all == true 
    #collect registrants from all workshops
      workshops.each do |line|
        line['registrants'].each do |r|
          nameslist.push r["name"]
          barcodes.push Barby::Code128.new(r["kerberos_id"])
          pngs.push Barby::PngOutputter.new(barcodes.last).to_image.to_data_url
        end
      end
    else
      selected_workshop = workshops.find{|w| w["id"] == workshop_id}
      selected_workshop["registrants"].each do |r|
        nameslist.push r["name"]
        barcodes.push Barby::Code128.new(r["kerberos_id"])
        pngs.push Barby::PngOutputter.new(barcodes.last).to_image.to_data_url
      end
    end

    set = nameslist.zip pngs
    if format == "address_labels"
      html = ApplicationController.render(file: Rails.root.join('app/views/events/address_labels.html.erb'), assigns: {set: set}, layout: false)
      File.open("/Users/CEE/Desktop/test_labels.html", "wb") do |file| file.write(html) end
    elsif format == "name_badge_stickers"
      html = ApplicationController.render(file: Rails.root.join('app/views/events/name_badge_stickers.html.erb'), assigns: {set: set}, layout: false)
    end
      
    
    kit = PDFKit.new(html, :margin_top => 0, :margin_bottom => 0, :margin_left => 0, :margin_right => 0, :dpi => 1600, :page_size => "A4")
    kit.to_pdf
  end

end


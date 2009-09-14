/*
 * A few useful plugins for Wildfire Specific Functionality
 * ADDS:
 *    1. Link interceptor to give a choice between regular urls and file urls
 *    2. Insert Video Button
 *    3. Insert Audio Button
 *    4. Overwrite default image insert to be awesome
 */

//Extend WYMeditor
WYMeditor.editor.prototype.wildfire = function() {
  var wym = this;
  
  jQuery(wym._box).find(".wym_tools_superscript").remove();
  jQuery(wym._box).find(".wym_tools_subscript").remove();
  jQuery(wym._box).find(".wym_tools_preview").remove();
  jQuery(wym._box).find(".wym_classes").removeClass("wym_panel").addClass("wym_dropdown");
  
  /*******************************************/
  /* Overwrite default link insert */
  /*******************************************/
  
  jQuery(wym._box).find(".wym_tools_link a").unbind("click");
  jQuery(wym._box).find(".wym_tools_link a").click(function(){
	  jQuery(".insert_web_url").unbind("click");
	  jQuery(".insert_web_url").click(function(){
	    var theURL = prompt("Enter the URL for this link:", "http://");
	    if (theURL != null) { 
	      wym._exec('CreateLink', theURL);
	      jQuery("#link_dialog").dialog("close");
	      return true;
	    }
	  });
	  jQuery(".insert_local_url").unbind("click");  
	  jQuery(".insert_local_url").click(function(){
	    theURL = jQuery("#link_file").val();
	    if (theURL != null) { 
	      wym._exec('CreateLink', theURL);
	      jQuery("#link_dialog").dialog("close");
	    }
	  });
    jQuery("#link_dialog").dialog("open");
    return false;
  });
  
  /*******************************************/
  /* Overwrite default paste from word */
  /*******************************************/
  jQuery(wym._box).find(".wym_tools_paste a").unbind("click");
  jQuery(wym._box).find(".wym_tools_paste a").click(function(){
    pasteHtml= "<form>"
               + "<fieldset>"
               + "<textarea class='wym_text' rows='10' cols='50'></textarea><br />"
               + "<input class='wym_submit' type='button' value='Submit' />"
               + "</fieldset>"
               + "</form>";
    jQuery('<div id="paste_word">'+pasteHtml+'</div>').dialog({title:"Paste From Word",width:700}).dialog("open");
    jQuery(".wym_submit").click(function(){wym.insert(jQuery(".wym_text").val()); jQuery("#paste_word").dialog("close");});
  });
  
  
  /*******************************************/
  /* Video Insertion Button */
  /*******************************************/
  
  var vidhtml = wym_button("video", "Insert a Video");
  jQuery(wym._box).find(".wym_tools_image").after(vidhtml);
  jQuery(wym._box).find(".wym_tools_video a").click(function(){
    jQuery("#video_dialog").dialog("open");
    jQuery("#insert_video_button").click(function(){
      var url = jQuery("#vid_id").val();
      var width = jQuery("#vid_x").val();
      var height = jQuery("#vid_y").val();
      var local = jQuery("#local_vid").val();
      if(local.length > 0) wym._exec('inserthtml', "<a href='"+url+"' rel='"+width+"px:"+height+"px'>LOCAL:"+local+"</a>");
    	else wym._exec('inserthtml', "<a href='"+url+"' rel='"+width+"px:"+height+"px'>"+url+"</a>");
      jQuery("#video_dialog").dialog("close");
    });
  });
  
  /*******************************************/
  /* Audio Insertion Button */
  /*******************************************/
  
  var audhtml = wym_button("audio", "Embed an Audio File");
  jQuery(wym._box).find(".wym_tools_video").after(audhtml);
  jQuery(wym._box).find(".wym_tools_audio a").click(function(){
    var audiofile = prompt("Enter Audio Filename");
    if(audiofile) wym._exec("inserthtml","<a href='#' rel='audiofile'>"+audiofile+"</a>");
  });
  
  /*******************************************/
  /* Inline Image Insertion Button */
  /*******************************************/
  jQuery(wym._box).find(".wym_tools_image a").unbind("click");
  jQuery(wym._box).find(".wym_tools_image a").click(function(){
    show_inline_image_browser(wym);
  });
  initialise_inline_image_edit(wym);
  
  /*******************************************/
  /* Table Insertion Button */
  /*******************************************/
  jQuery(wym._box).find(".wym_tools_table a").unbind("click");
  jQuery(wym._box).find(".wym_tools_table a").click(function(){
    jQuery("#table_dialog").dialog("open");
    jQuery("#insert_table_button").click(function(){
      var sCaption = jQuery(".wym_caption").val();
      var sSummary = jQuery(".wym_summary").val();
      var iRows = jQuery(".wym_rows").val();
      var iCols = jQuery(".wym_cols").val();
      if(iRows > 0 && iCols > 0) {
        var table = wym._doc.createElement(WYMeditor.TABLE);
        var newRow = null;
		    var newCol = null;
		    var sCaption = jQuery(wym._options.captionSelector).val();
		    var newCaption = table.createCaption();
		    newCaption.innerHTML = sCaption;
        for(x=0; x<iRows; x++) {
			    newRow = table.insertRow(x);
			    for(y=0; y<iCols; y++) {newRow.insertCell(y);}
		    }
        //set the summary attr
        jQuery(table).attr('summary', sSummary);
      }
      wym._exec('inserthtml', jQuery('<div>').append(jQuery(table).clone()).remove().html());
      jQuery("#table_dialog").dialog("close");
    });
  });

  
};

function wym_button(name, title) {
  var html = "<li class='wym_tools_"+name+"'>"
              + "<a name='"+name+"' href='#'"
              + title
              + "</a></li>";
  return html;
}


function initialise_inline_image_edit(wym) {
  jQuery(wym._doc).find("img").unbind("dblclick");
  jQuery(wym._doc).find("img").dblclick(function(){
    image_to_edit = jQuery(this);
    jQuery(wym._doc).find(".inline_image").unbind("dblclick");
    var image_browser = '<div id="inline_image_browser" class="inline_edit_existing"><div id="inline_close_bar"><h3>Edit Image</h3><a id="inline_close" href="#">x</a></div></div>';
    jQuery("body").append(image_browser);
    jQuery("#inline_image_browser").centerScreen();
    jQuery("#inline_close").click(function(){
      jQuery("#inline_image_browser").remove();
      initialise_inline_image_edit(wym); 
      return false;
    });
    jQuery.get("/admin/files/inline_image_edit", function(response){
      jQuery("#inline_image_browser").append(response);
      jQuery("#selected_image img").attr("src", image_to_edit.attr("src")).css("width", "90px");
      jQuery("#image_meta input").removeAttr("disabled");
      jQuery("#meta_description").val(image_to_edit.attr("alt"));
      if(image_to_edit.hasClass("flow_left")) jQuery("#flow_left input").attr("checked", true);
      if(image_to_edit.hasClass("flow_right")) jQuery("#flow_right input").attr("checked", true);
      if(image_to_edit.parent().is("a")) jQuery("#inline_image_link").val(image_to_edit.parent().attr("href"));
      jQuery("#inline_insert .generic_button a").click(function(){
        if(jQuery("#flow_normal input").attr("checked")) var img_class = "inline_image flow_normal";
        if(jQuery("#flow_left input").attr("checked")) var img_class = "inline_image flow_left";
        if(jQuery("#flow_right input").attr("checked")) var img_class = "inline_image flow_right";
        var img_html= '<img style="" src="'+jQuery("#selected_image img").attr("src")+'" class="'+img_class+'" alt="'+jQuery("#meta_description").val()+'" />';
        if(jQuery("#inline_image_link").val().length > 1) img_html = '<a href="'+jQuery("#inline_image_link").val()+'">'+img_html+"</a>";
        image_to_edit.replaceWith(img_html);
    		jQuery("#inline_image_browser").remove(); 
    		initialise_inline_image_edit(wym);
    		return false;
      });
    });
  });
}



var inline_image_filter_timer;

function inline_image_filter_post(wym){
  jQuery.post("/admin/files/image_filter",
    {filter: jQuery("#filter_field").val()}, 
    function(response){ 
      jQuery("#inline_image_browser #image_display").html(response);
      init_inline_image_select(wym);
      clearTimeout(inline_image_filter_timer);
    }
  );
}

function show_inline_image_browser(wym) {
  var wym = wym;
  var image_browser = '<div id="inline_image_browser"><div id="inline_close_bar"><h3>Insert Image</h3><a id="inline_close" href="#">x</a></div></div>';
  jQuery("body").append(image_browser);
  jQuery("#inline_image_browser").centerScreen();
  jQuery("#inline_close").click(function(){
    jQuery("#inline_image_browser").remove(); return false;
  });
  $.get("/admin/files/inline_browse/1/", function(response){
    jQuery("#inline_image_browser").append(response);
    init_inline_image_select(wym);
    
    jQuery("#inline_image_browser #filter_field").keyup(function(e) {
			if (e.which == 8 || e.which == 32 || (65 <= e.which && e.which <= 65 + 25) || (97 <= e.which && e.which <= 97 + 25) || e.which == 160 || e.which == 127) {
				clearTimeout(inline_image_filter_timer);
				inline_image_filter_timer = setTimeout(function(){inline_image_filter_post(wym);}, 800);
			}
    });
  });
}

function init_inline_image_select(wym) {  
  jQuery("#image_display .edit_img").remove();
  jQuery("#image_display div img").hover(function(){jQuery(this).css("border", "2px solid #222");}, function(){ jQuery(this).css("border","2px solid white");} );
  jQuery("#image_display div .add_image,#image_display div .edit_image,#image_display div .url_image").remove();
  jQuery("#image_display div img").click(function(){
    jQuery("#image_meta input").removeAttr("disabled");
    jQuery("#selected_image img").attr("src", "/show_image/"+jQuery(this).parent().parent().attr("id")+"/90.jpg");
    jQuery("#inline_insert .generic_button a").click(function(){
      if(jQuery("#flow_normal input").attr("checked")) var img_class = "inline_image flow_normal";
      if(jQuery("#flow_left input").attr("checked")) var img_class = "inline_image flow_left";
      if(jQuery("#flow_right input").attr("checked")) var img_class = "inline_image flow_right";
      var img_html= '<img style="" src="'+jQuery("#selected_image img").attr("src")+'" class="'+img_class+'" alt="'+jQuery("#meta_description").val()+'" />';
      if(jQuery("#inline_image_link").val().length > 1) img_html = '<a href="'+jQuery("#inline_image_link").val()+'">'+img_html+"</a>";
      wym.insert(img_html);
  		jQuery("#inline_image_browser").remove(); 
  		initialise_inline_image_edit(wym);
  		return false;
    });
  });
}

jQuery.fn.centerScreen = function(loaded) { 
  var obj = this; 
  if(!loaded) { 
    obj.css('top', jQuery(window).height()/2-this.height()/2); 
    obj.css('left', jQuery(window).width()/2-this.width()/2); 
    jQuery(window).resize(function() { obj.centerScreen(!loaded); }); 
  } else { 
    obj.stop(); 
    obj.animate({ 
      top: jQuery(window).height()/2-this.height()/2, 
      left: jQuery(window).width()/2-this.width()/2}, 200, 'linear'); 
  } 
};

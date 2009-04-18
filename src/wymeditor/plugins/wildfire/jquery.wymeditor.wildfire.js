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
  
  $(".wym_tools_superscript").remove();
  $(".wym_tools_subscript").remove();
  $(".wym_tools_preview").remove();
  $(".wym_classes").removeClass("wym_panel").addClass("wym_dropdown");
  
  /*******************************************/
  /* Overwrite default link insert */
  /*******************************************/
  
  $(".wym_tools_link a").unbind("click");
  $(".wym_tools_link a").click(function(){
    $("#link_dialog").dialog("open");
    $("#insert_web_url").click(function(){
      var theURL = prompt("Enter the URL for this link:", "http://");
      if (theURL != null) { 
        wym._exec('CreateLink', theURL);
        $("#link_dialog").dialog("close");
      }
    });
    $("#insert_local_url").click(function(){
      theURL = $("#link_file").val();
      if (theURL != null) { 
        wym._exec('CreateLink', theURL);
        $("#link_dialog").dialog("close");
      }
    });
    return false;
  });
  
  /*******************************************/
  /* Video Insertion Button */
  /*******************************************/
  
  var vidhtml = wym_button("video", "Insert a Video");
  $(wym._box).find(".wym_tools_image").after(vidhtml);
  $(".wym_tools_video a").click(function(){
    $("#video_dialog").dialog("open");
    $("#insert_video_button").click(function(){
      var url = $("#vid_id").val();
      var width = $("#vid_x").val();
      var height = $("#vid_y").val();
      var local = $("#local_vid").val();
      if(local.length > 0) wym._exec('inserthtml', "<a href='"+url+"' rel='"+width+"px:"+height+"px'>LOCAL:"+local+"</a>");
    	else wym._exec('inserthtml', "<a href='"+url+"' rel='"+width+"px:"+height+"px'>"+url+"</a>");
      $("#video_dialog").dialog("close");
    });
  });
  
  /*******************************************/
  /* Audio Insertion Button */
  /*******************************************/
  
  var audhtml = wym_button("audio", "Embed an Audio File");
  $(wym._box).find(".wym_tools_video").after(audhtml);
  $(".wym_tools_audio a").click(function(){
    var audiofile = prompt("Enter Audio Filename");
    if(audiofile) wym._exec("inserthtml","<a href='#' rel='audiofile'>"+audiofile+"</a>");
  });
  
  /*******************************************/
  /* Inline Image Insertion Button */
  /*******************************************/
  $(".wym_tools_image a").unbind("click");
  $(".wym_tools_image a").click(function(){
    show_inline_image_browser(wym);
  });
  initialise_inline_image_edit(wym);
  
};

function wym_button(name, title) {
  var html = "<li class='wym_tools_"+name+"'>"
              + "<a name='"+name+"' href='#'"
              + title
              + "</a></li>";
  return html;
}


function initialise_inline_image_edit(wym) {
  
  $(wym._doc).find(".inline_image").each(function(){
    alert("found one");
  });
  wym.find(".inline_image").dblclick(function(){
    image_to_edit = $(this);
    var image_browser = '<div id="inline_image_browser" class="inline_edit_existing"><div id="inline_close_bar"><h3>Edit Image</h3><a id="inline_close" href="#">x</a></div></div>';
    $("body").append(image_browser);
    $("#inline_image_browser").centerScreen();
    $("#inline_close").click(function(){
      $("#inline_image_browser").remove(); return false;
    });
    $.get("/admin/files/inline_image_edit", function(response){
      $("#inline_image_browser").append(response);
      $("#selected_image img").attr("src", image_to_edit.attr("src")).css("width", "90px");
      $("#image_meta input").removeAttr("disabled");
      $("#meta_description").val(image_to_edit.attr("alt"));
      if(image_to_edit.hasClass("flow_left")) $("#flow_left input").attr("checked", true);
      if(image_to_edit.hasClass("flow_right")) $("#flow_right input").attr("checked", true);
      if(image_to_edit.parent().is("a")) $("#inline_image_link").val(image_to_edit.parent().attr("href"));
      $("#inline_insert .generic_button a").click(function(){
        if($("#flow_normal input").attr("checked")) var img_class = "inline_image flow_normal";
        if($("#flow_left input").attr("checked")) var img_class = "inline_image flow_left";
        if($("#flow_right input").attr("checked")) var img_class = "inline_image flow_right";
        var img_html= '<img style="" src="'+$("#selected_image img").attr("src")+'" class="'+img_class+'" alt="'+$("#meta_description").val()+'" />';
        if($("#inline_image_link").val().length > 1) img_html = '<a href="'+$("#inline_image_link").val()+'">'+img_html+"</a>";
        alert(img_html);
        wym._exec("inserthtml", img_html);
    		$("#inline_image_browser").remove(); return false;
    		initialise_inline_image_edit();
      });
    });
  });
}



var inline_image_filter_timer;

function inline_image_filter_post(wym){
  $.post("/admin/files/image_filter",
    {filter: $("#filter_field").val()}, 
    function(response){ 
      $("#inline_image_browser #image_display").html(response);
      init_inline_image_select(wym);
      clearTimeout(inline_image_filter_timer);
    }
  );
}

function show_inline_image_browser(wym) {
  var image_browser = '<div id="inline_image_browser"><div id="inline_close_bar"><h3>Insert Image</h3><a id="inline_close" href="#">x</a></div></div>';
  $("body").append(image_browser);
  $("#inline_image_browser").centerScreen();
  $("#inline_close").click(function(){
    $("#inline_image_browser").remove(); return false;
  });
  $.get("/admin/files/inline_browse/1/", function(response){
    $("#inline_image_browser").append(response);
    init_inline_image_select(wym);
    
    $("#inline_image_browser #filter_field").keyup(function(e) {
			if (e.which == 8 || e.which == 32 || (65 <= e.which && e.which <= 65 + 25) || (97 <= e.which && e.which <= 97 + 25) || e.which == 160 || e.which == 127) {
				clearTimeout(inline_image_filter_timer);
				inline_image_filter_timer = setTimeout("inline_image_filter_post(wym)", 800);
			}
    });
  });
}

function init_inline_image_select(wym) {  
  $("#image_display .edit_img").remove();
  $("#image_display div img").hover(function(){$(this).css("border", "2px solid #222");}, function(){ $(this).css("border","2px solid white");} );
  $("#image_display div .add_image,#image_display div .edit_image,#image_display div .url_image").remove();
  $("#image_display div img").click(function(){
    $("#image_meta input").removeAttr("disabled");
    $("#selected_image img").attr("src", "/show_image/"+$(this).parent().parent().attr("id")+"/90.jpg");
    $("#inline_insert .generic_button a").click(function(){
      if($("#flow_normal input").attr("checked")) var img_class = "inline_image flow_normal";
      if($("#flow_left input").attr("checked")) var img_class = "inline_image flow_left";
      if($("#flow_right input").attr("checked")) var img_class = "inline_image flow_right";
      var img_html= '<img style="" src="'+$("#selected_image img").attr("src")+'" class="'+img_class+'" alt="'+$("#meta_description").val()+'" />';
      if($("#inline_image_link").val().length > 1) img_html = '<a href="'+$("#inline_image_link").val()+'">'+img_html+"</a>";
      alert(img_html);
      wym._exec("inserthtml", img_html);
  		$("#inline_image_browser").remove(); 
  		initialise_inline_image_edit(wym);
  		return false;
    });
  });
}

jQuery.fn.centerScreen = function(loaded) { 
  var obj = this; 
  if(!loaded) { 
    obj.css('top', $(window).height()/2-this.height()/2); 
    obj.css('left', $(window).width()/2-this.width()/2); 
    $(window).resize(function() { obj.centerScreen(!loaded); }); 
  } else { 
    obj.stop(); 
    obj.animate({ 
      top: $(window).height()/2-this.height()/2, 
      left: $(window).width()/2-this.width()/2}, 200, 'linear'); 
  } 
};

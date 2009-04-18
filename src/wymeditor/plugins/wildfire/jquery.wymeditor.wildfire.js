/*
 * A few useful plugins for Wildfire Specific Functionality
 * ADDS:
 *    1. Link interceptor to give a choice between regular urls and file urls
 *    2. Insert Video Button
 *    3. Insert Audio Button
 *  
 */

//Extend WYMeditor
WYMeditor.editor.prototype.wildfire = function(options) {
  $(".wym_tools_superscript").remove();
  $(".wym_tools_subscript").remove();
  $(".wym_tools_preview").remove();
  $(".wym_classes").removeClass("wym_panel").addClass("wym_dropdown");
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
  
  /* Video Insertion Button */
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
  /* Audio Insertion Button */
  var audhtml = wym_button("audio", "Embed an Audio File");
  $(wym._box).find(".wym_tools_video").after(audhtml);
  $(".wym_tools_audio a").click(function(){
    var audiofile = prompt("Enter Audio Filename");
    if(audiofile) wym._exec("inserthtml","<a href='#' rel='audiofile'>"+audiofile+"</a>");
  });
  
};

function wym_button(name, title) {
  var html = "<li class='wym_tools_"+name+"'>"
              + "<a name='"+name+"' href='#'"
              + title
              + "</a></li>";
  return html;
}

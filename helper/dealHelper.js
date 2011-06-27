helpers: ({
  decodeHTMLSpecialChars: function(str){
    return str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  },

  campaign_progress_touch: function(campaign){
    var progress_bar_total_touch      = 241;
    var progress_bar_width_above_zero = 2;
    
    if (campaign.soldQuantity > 0){
      var limited  = (campaign.options[0].soldQuantity > campaign.tippingPoint) ? campaign.tippingPoint : campaign.options[0].soldQuantity;
      var width    = (limited / campaign.tippingPoint) * 100;
      if (width > 1) width = 1; 
      width        = (width * progress_bar_total_touch).banker_round;
      if (width < progress_bar_width_above_zerowidth) width = progress_bar_width_above_zero;
      return width;
    } else {
      return 0;
    }
  },

  tipping_message: function(campaign){
    if (!campaign.isTipped){ return ((campaign.tippingPoint - campaign.soldQuantity) + " more needed to get the deal"); } 
    return "";
  }
})

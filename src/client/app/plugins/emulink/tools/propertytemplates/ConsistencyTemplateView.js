/**
 * PropertyTemplates plugin.
 * @author Paolo Masci
 * @date Oct 4, 2016
 */
 /*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
 /*jshint unused:false*/
 define(function (require, exports, module) {
     "use strict";
     var d3 = require("d3/d3"),
         formTemplate = require("text!./consistency/frontend.handlebars"),
         theoremTemplate = require("text!./consistency/consistency.handlebars"),
         BaseDialog = require("pvsioweb/forms/BaseDialog"),
         FormUtils = require("plugins/emulink/forms/FormUtils");

     var default_data = { actions: ["act"], R: "R", s: "s" };
     var ConsistencyTemplateView = BaseDialog.extend({
         initialize: function (data) {
             d3.select(this.el).attr("class", "overlay").style("top", self.scrollY + "px");
             this.render(data);
             this._data = data;
             this.focus();
         },
         render: function (data) {
             var template = Handlebars.compile(formTemplate);
             this.$el.html(template(data));
             $("body").append(this.el);
             d3.select("#pvs_theorem").html(Handlebars.compile(theoremTemplate)(default_data));
             return this;
         },
         events: {
             "input #relation": "updateTheorem",
             "input #stateVariable": "updateTheorem",
             "input #transitions": "updateTheorem",
             "click #btnRight": "right",
             "click #btnLeft": "left",
             "keydown .panel": "keypress"
         },
         updateTheorem: function (event) {
             var data = default_data;
             var transitions = d3.select("#ConsistencyTemplate").select("#transitions").node();
             if (transitions && transitions.selectedOptions && transitions.selectedOptions.length > 0) {
                 data.actions = [];
                 for (var i = 0; i < transitions.selectedOptions.length; i++) {
                     if (transitions.selectedOptions[i].value !== "") {
                         data.actions.push(transitions.selectedOptions[i].value);
                     }
                 }
             }
             var relation = d3.select("#ConsistencyTemplate").select("#relation").node();
             if (relation && relation.selectedOptions && relation.selectedOptions.length > 0) {
                 data.R = d3.select("#ConsistencyTemplate").select("#relation").node().selectedOptions[0].value || data.R;
             }
             var attributes = d3.select("#ConsistencyTemplate").select("#stateVariable").node();
             if (attributes && attributes.selectedOptions && attributes.selectedOptions.length > 0) {
                 data.s = d3.select("#ConsistencyTemplate").select("#stateVariable").node().selectedOptions[0].value.replace(/\./g, "`") || data.s;
             }
            //  d3.select("#pvs_theorem").html(Handlebars.compile(theoremTemplate)(data));
            d3.select("#pvs_theorem").node().value = Handlebars.compile(theoremTemplate)(data);
         },
         right: function (event) {
             var form = this.el;
             if (FormUtils.validateForm(form)) {
                 var selectors = [ "pvs_theorem" ];
                 var formdata = FormUtils.serializeForm(form, selectors);
                 this.trigger(this._data.buttons[1].toLowerCase(), {data: formdata.labels, el: this.el}, this);
             }
         },
         left: function (event) {
             this.trigger(this._data.buttons[0].toLowerCase(), {el: this.el}, this);
         },
         keypress: function (event) {
             var form = this.el;
             switch(event.which) {
             case 13: //enter pressed
                 this.right(event);
                 break;
             case 27: //esc pressed
                 this.left(event);
                 break;
             default: break;
             }
         }
     });

     module.exports = {
         /**
          * creates a new form view to display questions. Renders two buttons for
          * taking positive or negative responses to the question posed.
          * @param {header: {string}, textLines: {string}} data Data to use to render the form
          */
         create: function (data) {
             return new ConsistencyTemplateView(data);
         }
     };
 });

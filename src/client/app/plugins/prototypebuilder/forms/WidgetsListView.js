/**
 * View that lists all widgets within a prototype
 * @author Nathaniel Watson
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, Backbone */
define(function (require, exports, module) {
    "use strict";

    var _this;

    var WidgetsListView = Backbone.View.extend({
        /**
         * @function initialize
         * @description Creates a new widget list view and renders it to the provided element
         * @param {Object} options Options for the view.
         * @param {WidgetManager} options.widgetManager Widget Manager to be used by the view
         * @param {function} options.labelFunction Function that generates the display text for a given widget
         */
        initialize: function (options) {
            this._widgetManager = options.widgetManager;
            this._labelFunction = options.labelFunction || function (w) {
                return w.toString();
            };
            this.$el.addClass("widgetsList noselect");
            var list = document.createElement("ul");
            this.$el.append(list);
            this.d3ListElement = d3.select(list);

            _this = this;

            this._widgetManager.on("WidgetModified", _this.update);
            this._widgetManager.on("WidgetSelected", function (event) {
                _this.selectWidget(event.widget, event.add);
            });
            this._widgetManager.on("WidgetSelectionCleared", function (event) {
                _this.d3ListElement.selectAll("li").classed("selected", false);
            });
            this.render();
        },

        /**
         * @function render
         * @description Updates and redraws the view.
         * @return {PrototypeImageView} The view
         */
        render: function () {
            _this.update();
            return _this;
        },

        /**
         * @function selectWidget
         * @description Displays the given widget as selected within the view
         * @param {Widget} widget Widget to select
         * @param {boolean} add True if the widget should be added to the current selection, false if only it should
         * be selected.
         */
        selectWidget: function(widget, add) {
            var element = _this.listItems.filter(function (d) { return d.id === widget.id; });
            if (!add) { _this.listItems.classed("selected", false); }
            element.classed("selected", true);
        },

        /**
        * @function update
        * @description Updates the data that the view displays (and updates the UI with any new/changed data)
        * //FIXME: when updating the widget list, we should keep the list ordered by widget type. At the moment, the new widget is always appended at the end of the list.
         */
        update: function () {
            _this.listItems = _this.d3ListElement.selectAll("li.list-group-item").data(_this._widgetManager.getAllWidgets(), function (widget) {
                return widget.id();
            });
            var enteredItems = _this.listItems.enter();
            var exitedItems = _this.listItems.exit();

            enteredItems.append("li").attr("class", "list-group-item")
                .attr("widget-id", function (w) {
                    _this.d3ListElement.selectAll("ul li").classed("selected", false);
                    return w.id();
                }).classed("selected", false)
                .text(_this._labelFunction)
                .on("click", function (w) {
                    var add = d3.event.shiftKey;
                    _this.selectWidget(w, add);
                    _this.trigger("WidgetSelected", w, add);
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                }).on("dblclick", function (w) {
                    var event = d3.event;
                    var dblclick = new Event("dblclick");
                    w.element().node().dispatchEvent(dblclick);
                    event.preventDefault();
                    event.stopPropagation();
                });
            _this.listItems.text(_this._labelFunction);
            exitedItems.transition().duration(220).style("opacity", 0).remove();
        }
    });

    return WidgetsListView;
});

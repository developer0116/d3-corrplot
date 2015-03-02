// Your Corrplot may have many modules.  How you organize the modules is up to
// you, but generally speaking it's best if each module addresses a specific
// concern.  No module should need to know about the implementation details of
// any other module.

// Note:  You must name this function something unique.  If you end up
// copy/pasting this file, the last function defined will clobber the previous
// one.
function initCorrplotChart(context) {

  'use strict';

  var Corrplot = context.Corrplot;


  // A Corrplot module can do two things to the Corrplot Object:  It can extend
  // the prototype to add more methods, and it can add static properties.  This
  // is useful if your Corrplot needs helper methods.


  // PRIVATE MODULE CONSTANTS
  //


  var MODULE_CONSTANT = true;


  // PRIVATE MODULE METHODS
  //


  /**
   *  An example of a private method.  Feel free to remove this.
   */
  function modulePrivateMethod() {
    return;
  }


  // Corrplot STATIC PROPERTIES
  //


  /**
   * An example of a static Corrplot property.  This particular static property
   * is also an instantiable Object.
   * @constructor
   */
  Corrplot.CorrplotHelper = function () {
    return this;
  };


  // Corrplot PROTOTYPE EXTENSIONS
  //
  // A module can extend the prototype of the Corrplot Object.


  /**
   * An example of a prototype method.
   * @return {string}
   */
  Corrplot.prototype.alternateGetReadOnlyVar = function () {
    // Note that a module can access all of the Corrplot instance variables with
    // the `this` keyword.
    return this._readOnlyVar;
  };

  d3.chart('corrplot', {
    initialize: function () {
      var chart = this;

      //initialize variables with default values
      this._loadDefaults(chart);

      var corrplotBase = this.base
          .attr('height', this.w + this.margin.top + this.margin.bottom)
          .attr('width', this.w + this.margin.left + this.margin.right)
          .style('margin-left', -this.margin.left + 'px')
          .append('g')
          .classed('corrplot', true)
          .attr('transform', 'translate (' + this.margin.left + ',' + this.margin.top + ')');

      //var corrplotBackground = corrplotBase.append('rect')
      //    .attr('class', 'background')
      //    .attr('width', this.w)
      //    .attr('height', this.w);

      this.layer('rows', corrplotBase, {
        dataBind: function (data) {
          var chart = this.chart(),
              matrix = data.matrix,
              order = data.order;

          //initialize x domain use order
          if (order === undefined) {
            order = d3.range(data.nodes.length);
          }
          chart.x.domain(order);

          //initialize coordinates
          matrix = matrix.map(function (row, i) {
            return row.map(function (cell, j) {
              return {x: j, y: i, z: cell};
            });
          });

          // return a data bound selection for the passed in data.
          return this.selectAll('.row')
              .data(matrix);
        },
        insert: function () {
          var chart = this.chart();

          // setup the elements that were just created
          return this.append('g')
              .classed('row', true);
        },

        // setup an enter event for the data as it comes in:
        events: {
          'merge': function () {
            var chart = this.chart();

            return this
                .attr('transform', function (d, i) {
                  return 'translate(0,' + chart.x(i) + ')';
                })
                .each(row);
          },

          'exit': function () {
            this.remove();
          }
        }
      });

      function row(row) {
        var cells = d3.select(this).selectAll('.cell').data(row);
        //comes the new ones
        cells
            .enter().append('path')
            .attr('class', 'cell')
            .on('mouseover', chart._mouseover)
            .on('mouseout', chart._mouseout);

        //goes the old
        cells
            .exit()
            .remove();

        //everyone needs to readjust their sizes
        cells
            .attr('transform', function (d) {
              var halfWidth = chart.x.rangeBand() / 2;
              return 'translate(' + (chart.x(d.x) + halfWidth) + ',' + halfWidth + ')';
            })
            .attr('fill', chart.c)
          //.attr('width', chart.x.rangeBand())
          //.attr('height', chart.x.rangeBand())
            .attr('d', function (d) {
              return chart._shape(d, chart.x.rangeBand());
            });
      }

      this.layer('rows-header', corrplotBase.append('g'), {
        dataBind: function (data) {
          var chart = this.chart(),
              nodes = data.nodes;

          nodes.forEach(function (node, i) {
            node.index = i;
          });

          return this.selectAll('.row-header')
              .data(nodes);
        },
        insert: function () {
          var chart = this.chart();

          return this
              .append('text')
              .classed('row-header', true);
        },
        events: {
          'merge': function () {
            var chart = this.chart();

            return this
                .attr('transform', function (d, i) {
                  return 'translate(0,' + chart.x(i) + ')';
                })
                .attr('x', -6)
                .attr('y', chart.x.rangeBand() / 2)
                .attr('dy', '.32em')
                .attr('text-anchor', 'end')
                .text(function (d) {
                  return d.name;
                })
          },

          'exit': function () {
            this.remove();
          }
        }
      });

      this.layer('cols-header', corrplotBase.append('g'), {
        dataBind: function (data) {
          var chart = this.chart(),
              nodes = data.nodes;

          return this.selectAll('.col-header')
              .data(nodes);
        },
        insert: function () {
          var chart = this.chart();

          return this
              .append('text')
              .classed('col-header', true);
        },
        events: {
          'merge': function () {
            var chart = this.chart();

            //FIXME: Implement shift in x/y when rotation is not -90
            return this
                .attr('transform', function (d, i) {
                  return 'translate(' + chart.x(i) + ')rotate(' + chart.colRotation + ')';
                })
                .attr('x', 6)
                .attr('y', chart.x.rangeBand() / 2)
                .attr('dy', '.32em')
                .attr('text-anchor', 'start')
                .text(function (d) {
                  return d.name;
                })
          },

          'exit': function () {
            this.remove();
          }
        }
      });

      //this.layer('cols-grid', corrplotBase.append('g'), {
      //  dataBind: function (data) {
      //    var chart = this.chart(),
      //        nodes = data.nodes;
      //
      //    return this.selectAll('.col-grid')
      //        .data(nodes);
      //  },
      //  insert: function () {
      //    var chart = this.chart();
      //
      //    return this
      //        .append('line')
      //        .classed('col-grid', true);
      //  },
      //  events: {
      //    'merge': function () {
      //      var chart = this.chart();
      //
      //      return this
      //          .attr('transform', function (d, i) {
      //            return 'translate(' + chart.x(i) + ')rotate(-90)';
      //          })
      //          .attr('x1', -chart.w);
      //    },
      //
      //    'exit': function () {
      //      this.remove();
      //    }
      //  }
      //});
    },

    _loadDefaults: function () {
      this.x = d3.scale.ordinal();
      this.width(720);

      var c = d3.scale.linear()
          .domain([-1, 0, 1])
          .range(['#ef8a62', '#f7f7f7', '#67a9cf']);
      this.color(function (d) {
        return c(d.z);
      });

      this.duration(0);
      this.margin({top: 80, right: 0, bottom: 10, left: 80});
      this.rotatecols(-90);

      this.shape(function (d, width) {
        return Corrplot.Shape.Square(width);
      });

      //TODO: Implement default tips
      this.mouseover(function () {
      });
      this.mouseout(function () {
      });
    },

    // configures the width/height of the chart.
    // when called without arguments, returns the
    // current width/height.
    width: function (newWidth) {
      if (arguments.length === 0) {
        return this.w;
      }
      this.w = newWidth;

      //update x range
      this.x = this.x.rangeBands([0, newWidth]);

      //redraw to refelct the size change
      this.reDraw();

      return this;
    },

    // configures the margin of the chart.
    // when called without arguments, returns the
    // current margin.
    margin: function (newMargin) {
      if (arguments.length === 0) {
        return this.margin;
      }
      this.margin = newMargin;
      return this;
    },

    // configures the rotation of the column headers.
    // when called without arguments, returns the
    // current rotation.
    rotatecols: function (newRotation) {
      if (arguments.length === 0) {
        return this.colRotation;
      }
      this.colRotation = newRotation;
      return this;
    },

    // configures the color scale of the elements in the chart.
    // when called without arguments, returns the
    // current color scale.
    color: function (newColor) {
      if (arguments.length === 0) {
        return this.c;
      }
      this.c = newColor;
      return this;
    },

    // configures the animation duration
    // when called without arguments, returns the
    // current animation duration.
    duration: function (newDuration) {
      if (arguments.length == 0) {
        return this.d;
      }
      this.d = newDuration;
      return this;
    },

    // configures the animation duration
    // when called without arguments, returns the
    // current animation duration.
    mouseover: function (newMouseover) {
      if (arguments.length == 0) {
        return this._mouseover;
      }
      this._mouseover = newMouseover;
      return this;
    },

    // configures the animation duration
    // when called without arguments, returns the
    // current animation duration.
    mouseout: function (newMouseout) {
      if (arguments.length == 0) {
        return this._mouseout;
      }
      this._mouseout = newMouseout;
      return this;
    },

    // configures the order of rows/columns in the chart.
    // when called without arguments, returns the
    // current order.
    // when called with arguments after the first time,
    // rows and columns are shifted with animation
    order: function (newOrder) {
      if (arguments.length == 0) {
        return this.x.domain();
      }

      if (this.x.domain().length === 0) {
        this.x.domain(newOrder);
      } else {
        this.x.domain(newOrder);

        var x = this.x,
            width = this.w,
            duration = this.d,
            colRotation = this.colRotation,
            t = this.base.transition().duration(duration);

        t.selectAll('.row')
            .delay(function (d, i) {
              return x(i) / width * duration;
            })
            .attr('transform', function (d, i) {
              return 'translate(0,' + x(i) + ')';
            })
            .selectAll('.cell')
            .delay(function (d) {
              return x(d.x) / width * duration;
            })
            .attr('transform', function (d) {
              var halfWidth = x.rangeBand() / 2;
              return 'translate(' + (x(d.x) + halfWidth) + ',' + halfWidth + ')';
            });

        t.selectAll('.row-header')
            .delay(function (d, i) {
              return x(i) / width * duration;
            })
            .attr('transform', function (d, i) {
              return 'translate(0,' + x(i) + ')';
            });

        t.selectAll('.col-header')
            .delay(function (d, i) {
              return x(i) / width * duration;
            })
            .attr('transform', function (d, i) {
              return 'translate(' + x(i) + ')rotate(' + colRotation + ')';
            });
      }

      return this;
    },

    shape: function (newShape) {
      if (arguments.length == 0) {
        return this._shape;
      }

      if (this._shape === undefined) {
        this._shape = newShape;
      } else {
        this._shape = newShape;

        var x = this.x,
            duration = this.d,
            t = this.base.transition().duration(duration);

        t.selectAll('.cell')
            .attr('d', function (d) {
              return newShape(d, x.rangeBand());
            });
      }

      return this;
    },

    // draw and save the data for future redraw
    drawAndSave: function (data) {
      this._data = data;
      this.draw(data);
      return this;
    },
    reDraw: function () {
      if (this._data) {
        this.base
            .attr('height', this.w + this.margin.top + this.margin.bottom)
            .attr('width', this.w + this.margin.left + this.margin.right);

        return this.draw(this._data);
      }
      return this;
    }
  });


  if (DEBUG) {
    // DEBUG CODE
    //
    // Each module can have its own debugging section.  They all get compiled
    // out of the binary.
  }

}

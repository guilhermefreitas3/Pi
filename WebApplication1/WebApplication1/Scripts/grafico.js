﻿<script type="javascript">
    function sendReturnMessage(msg) {
        window.parent.postMessage(msg, "*");
    }

            // ==========================================================================================   BEGIN SCRIPT

            // ================================================   CANVAS:
            var rodaCanvas = document.getElementById("GraficoID");
            ctx = rodaCanvas.getContext("2d");
            // --------  Fator de corre??o da posi??o do canvas:
            var canvasRect = rodaCanvas.getBoundingClientRect();
            var canvasLeft = canvasRect.left;
            var canvasTop = canvasRect.top;
            // -------------------------------------------------

            var pie_CenterX = rodaCanvas.width / 2;
            var pie_CenterY = rodaCanvas.height / 2;
            var pie_Radius = rodaCanvas.width / 3.5;
            var offset = 30;

            var cX = pie_CenterX;
            var cY = pie_CenterY;
            var p1X = pie_CenterX + pie_Radius;
            var p1Y = pie_CenterY;

            var label_Radius = pie_Radius + 10;                 // labels outside the circle
            var unit_Radius = pie_Radius / 100;                 // 1% of total radius
            var labelFont = "14px verdana";                     // "12px Arial";
            var pie_Slices = 10;                                // 10 slices in pie
            var sweep_Angle = 360 / pie_Slices;                 // pie slice = 10% of circle (36 graus)

            var labelOriginal = "";

            var moving = false;
            var primeValue = -1;
            var primeSlice = -1;
            var primeRadius = -1;

            var rotating = false;

            //var encerrado=false;

            // -----------------------------------------------------------  EVENTOS MOUSE:
            rodaCanvas.addEventListener("mousemove", function (event) {
                if (!rotating)
                    funcaoMouseMove(event);
            });

            rodaCanvas.addEventListener("mousedown", function (event) {
                if (!rotating)
                    funcaoMouseDown(event);
            });

            rodaCanvas.addEventListener("mouseup", function (event) {
        funcaoMouseUp(event);
    });

            rodaCanvas.onmouseout = function () {funcaoMouseOut(); };

            // -----------------------------------------------------------  EVENTOS TOUCH:
            rodaCanvas.addEventListener('touchstart', function (e) {
                if (!moving) {
                    if (e.touches.length === 1 && e.targetTouches.length === 1) {
                        var touchobj = e.changedTouches[0];                 // reference first touch point (ie: first finger)
                        touchX = parseInt(touchobj.clientX);                // get x position of touch point relative to left edge of browser
                        touchY = parseInt(touchobj.clientY);                // get y position of touch point relative to top edge of browser
                        ResizeSlice(parseInt(touchX), touchY);
                    }
                }
            }, false);

            rodaCanvas.addEventListener('touchmove', function (e) {
                if (moving) {
                    if (e.touches.length === 1 && e.targetTouches.length === 1) {
                        var touchobj = e.changedTouches[0];             // reference first touch point for this event
                        tX = parseInt(touchobj.clientX);                // get x position of touch point relative to left edge of browser
                        tY = parseInt(touchobj.clientY);                // get y position of touch point relative to top edge of browser
                        ResizeSlice(tX, tY);
                        e.preventDefault();
                    }
                }
            }, false);

            rodaCanvas.addEventListener('touchend', function (e) {
                if (moving) {
        myPie.PieLabels(labelColor, false);                 // draw
    var touchobj = e.changedTouches[0];                 // reference first touch point for this event

                    // Cnacel resize:
                    primeSlice = -1;
                    primeValue = -1;
                    primeRadius = -1;
                    moving = false;
                }
            }, false);

            rodaCanvas.addEventListener('touchleave', function (e) {
                if (moving) {
        myPie.PieLabels(labelColor, false);                 // draw
    var touchobj = e.changedTouches[0];                 // reference first touch point for this event

                    // Cnacel resize:
                    primeSlice = -1;
                    primeValue = -1;
                    primeRadius = -1;
                    moving = false;
                }
            }, false);

            // ------------------------------------------------- Inicial values, labels, colors and angles:

            var myValues = {
        "slice0": 100,
                "slice1": 100,
                "slice2": 100,
                "slice3": 100,
                "slice4": 100,
                "slice5": 100,
                "slice6": 100,
                "slice7": 100,
                "slice8": 100,
                "slice9": 100
            };

            var myValuesBackup = {
        "slice0": 0,
                "slice1": 0,
                "slice2": 0,
                "slice3": 0,
                "slice4": 0,
                "slice5": 0,
                "slice6": 0,
                "slice7": 0,
                "slice8": 0,
                "slice9": 0
            };

            var bgColor = "White";              // background color
            var outlineColor = "LightGray";     // outline color
            var labelColor = "Black ";          // label color

            var myColors = {
        "slice0": "DarkKhaki",
                "slice1": "DeepSkyBlue",
                "slice2": "DarkGoldenrod",
                "slice3": "DarkMagenta",
                "slice4": "Tomato",
                "slice5": "RoyalBlue",
                "slice6": "Crimson",
                "slice7": "DarkGreen",
                "slice8": "CadetBlue",
                "slice9": "Orange"
            };

            var myColorsBackup = {
        "slice0": "",
                "slice1": "",
                "slice2": "",
                "slice3": "",
                "slice4": "",
                "slice5": "",
                "slice6": "",
                "slice7": "",
                "slice8": "",
                "slice9": ""
            };

            var myLabels = {                    // MAX: 20 chars !
        "slice0": "Sa?de e bem estar",
                "slice1": "Vida financeira",
                "slice2": "Fam?lia",
                "slice3": "Amigos",
                "slice4": "Trabalho e carreira",
                "slice5": "Espiritualidade",
                "slice6": "Amor",
                "slice7": "Divers?o",
                "slice8": "Crescimento pessoal",
                "slice9": "Contribui??o social"
            };

            var myAngles = {
        "slice0": 0 * sweep_Angle,
                "slice1": 1 * sweep_Angle,
                "slice2": 2 * sweep_Angle,
                "slice3": 3 * sweep_Angle,
                "slice4": 4 * sweep_Angle,
                "slice5": 5 * sweep_Angle,
                "slice6": 6 * sweep_Angle,
                "slice7": 7 * sweep_Angle,
                "slice8": 8 * sweep_Angle,
                "slice9": 9 * sweep_Angle
            };

            function DegreeToRadian(angle) {
                return Math.PI * angle / 180;
            }

            function RadianToDegree(angle) {
                return angle * (180 / Math.PI);
            }

            function RandomValue(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }

            function FindAngle(s1p1X, s1p1Y, s1p2X, s1p2Y, s2p1X, s2p1Y, s2p2X, s2p2Y) {
                // Find the angle between two segments:
                // ------------------------------------
                // Let s1 and s2 the segments, so you can calculate the angle of each using:
                //  atan2(s.p1.y - s.p2.y, s.p1.x - s.p2.x)
                //  where p1 and p2 are the two points defining s;
                // ------------------------------------
                var theta1 = Math.atan2(s1p1Y - s1p2Y, s1p1X - s1p2X);
                var theta2 = Math.atan2(s2p1Y - s2p2Y, s2p1X - s2p2X);
                // Taking the value of the difference, you get the angle between the segments:
                var angle = theta1 - theta2;

                return 2 * Math.PI - angle;
            }

            function DrawLine(ctx, startX, startY, endX, endY, color) {
        ctx.strokeStyle = color;
    ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }

            function DrawRect(ctx, startX, startY, endX, endY, color) {
        ctx.strokeStyle = color;
    ctx.strokeRect(startX, startY, endX, endY);
            }

            function DrawArc(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
        ctx.lineWidth = 2;
    ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.stroke();
                ctx.lineWidth = 1;
            }

            function DrawSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color, lWidth) {
                // Outline:
                if (radius > 0) {
        ctx.lineWidth = lWidth;
    ctx.strokeStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius - 1, startAngle, endAngle);
                    ctx.lineTo(centerX, centerY);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.lineWidth = 1;
                }
            }

            function FillSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
        ctx.fillStyle = color;
    ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fill();
            }

            function DrawLabel(ctx, slice, label, color) {
                // Position the labels outside the slice's edge:
                // ---------------------------------------------
                var labelAngle = Math.PI * (myAngles[slice] + sweep_Angle / 2) / 180;
                var angle = myAngles[slice] + sweep_Angle;
                var labelX = pie_CenterX + label_Radius * Math.cos(labelAngle);
                var labelY = pie_CenterY + label_Radius * Math.sin(labelAngle);
                ctx.font = labelFont;

                //label = angle;        // --- For tests only !

                var label_Width = 0;
                var label_Height = 0;

                if (color === bgColor)
                    label_Width = rodaCanvas.clientWidth / 5;
                else
                    label_Width = parseInt(ctx.measureText(label).width);
                label_Height = parseInt(labelFont);

                label_Width = label_Width + 5;
                label_Height = label_Height + 5;

                //if (color === bgColor) alert("label - Width: " + label_Width + "  Height: " + label_Height);

                // adjust for label width | height:
                if (angle > 108 && angle < 288)
                    labelX = labelX - label_Width;
                if (angle === 288 || angle === 108)
                    labelX = labelX - label_Width / 2;
                if (angle >= 0 && angle <= 180)
                    labelY = labelY + label_Height / 2;

                labelX = Math.round(labelX);
                labelY = Math.round(labelY);

                // clear label:
                //DrawRect(ctx, labelX, labelY - (label_Height - 4), label_Width, label_Height, "Blue");        // --- For tests only !
                ctx.fillStyle = bgColor;
                ctx.fillRect(labelX, labelY - (label_Height - 4), label_Width, label_Height);

                // draw label:
                ctx.fillStyle = color;
                ctx.fillText(label, labelX, labelY);
            }

            // -----------------------------------  mouse cursor control
            function MouseOnSlice(mouseX, mouseY) {
                if (!moving) {
                    var p2X = mouseX - canvasLeft;
                    var p2Y = mouseY - canvasTop;
                    var angulo = FindAngle(cX, cY, p1X, p1Y, cX, cY, p2X, p2Y);
                    var radius = Math.sqrt(Math.pow(p2X - cX, 2) + Math.pow(p2Y - cY, 2));
                    var slice = Math.trunc(angulo / DegreeToRadian(sweep_Angle));
                    if (slice >= 0 && slice < pie_Slices && radius <= pie_Radius + offset)
                        rodaCanvas.style.cursor = "pointer";
                    else
                        rodaCanvas.style.cursor = "default";
                }
            }

            function ResizeSlice(mouseX, mouseY) {
                // c = center of Pie (X & Y)
                // p1 = center of Pie + pie_Radius -> X , Center of Pie -> Y
                // p2 = mouse location (X & Y)
                var p2X = mouseX - canvasLeft;
                var p2Y = mouseY - canvasTop;
                var angulo = FindAngle(cX, cY, p1X, p1Y, cX, cY, p2X, p2Y);
                var radius = Math.sqrt(Math.pow(p2X - cX, 2) + Math.pow(p2Y - cY, 2));
                var actualSlice = Math.trunc(angulo / DegreeToRadian(sweep_Angle));

                if (actualSlice >= 0 && actualSlice < pie_Slices) {
                    var slice = "slice" + actualSlice;

                    if (primeSlice === -1 && radius <= pie_Radius + offset) {
        primeRadius = radius;
    primeValue = myValues[slice];
                        primeSlice = actualSlice;

                        labelOriginal = myLabels[slice];
                    }

                    if (actualSlice === primeSlice) {
                        if (moving) {
                            var spamRadius = radius - primeRadius;
                            var spamValue = Math.trunc(spamRadius / unit_Radius);
                            var sliceValue = primeValue + spamValue;
                            if (sliceValue > 100) sliceValue = 100;
                            if (sliceValue < 0) sliceValue = 0;
                            var sliceRadius = unit_Radius * sliceValue;

                            // save slice value:
                            myValues[slice] = sliceValue;

                            // clear slice:
                            if (sliceValue <= myValues[slice]) {
        FillSlice(
            ctx,
            pie_CenterX,
            pie_CenterY,
            pie_Radius,
            DegreeToRadian(myAngles[slice]),
            DegreeToRadian(myAngles[slice] + sweep_Angle),
            bgColor
        );
    DrawSlice(
                                    ctx,
                                    pie_CenterX,
                                    pie_CenterY,
                                    pie_Radius,
                                    DegreeToRadian(myAngles[slice]),
                                    DegreeToRadian(myAngles[slice] + sweep_Angle),
                                    bgColor,
                                    1
                                );
                            }

                            // fill new slice:
                            FillSlice(
                                ctx,
                                pie_CenterX,
                                pie_CenterY,
                                sliceRadius,
                                DegreeToRadian(myAngles[slice]),
                                DegreeToRadian(myAngles[slice] + sweep_Angle),
                                myColors[slice]
                            );
                            DrawSlice(
                                ctx,
                                pie_CenterX,
                                pie_CenterY,
                                sliceRadius,
                                DegreeToRadian(myAngles[slice]),
                                DegreeToRadian(myAngles[slice] + sweep_Angle),
                                bgColor,     //myColors[slice]
                                1
                            );

                            // draw label (%):
                            label = myValues[slice] + "%";
                            DrawLabel(ctx, slice, label, bgColor);  // clear
                            DrawLabel(ctx, slice, label, "DarkRed");    // draw
                        }

                        moving = true;
                    }
                }
            }

            function PieBackup() {
                var slice = 0;
                for (s = 0; s < pie_Slices; s++) {
        slice = "slice" + s;
    myValuesBackup[slice] = myValues[slice];
                    myColorsBackup[slice] = myColors[slice];
                }
            }

            function PieRestore() {
                var slice = 0;
                for (s = 0; s < pie_Slices; s++) {
        slice = "slice" + s;
    myValues[slice] = myValuesBackup[slice];
                    myColors[slice] = myColorsBackup[slice];
                }
            }

            // ------------------------------
            //   canvas function:  .clear()
            // ------------------------------
            CanvasRenderingContext2D.prototype.clear =
            CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
                if (preserveTransform) {
        this.save();
    this.setTransform(1, 0, 0, 1, 0, 0);
                }
                this.rect(0, 0, this.canvas.width, this.canvas.height);
                this.fillStyle = bgColor;
                this.fill();
                if (preserveTransform) {
        this.restore();
    }
            };

            // --------------------------
            // ---------------------  Pie
            // --------------------------
            var Pie = function (options) {
        this.options = options;
    this.canvas = options.canvas;
                this.ctx = this.canvas.getContext("2d");

                this.ClearBackground = function () {
        ctx.clear(true);
    };

                this.DrawBackground = function (color) {
        // draw canvas border:
        DrawRect(ctx, this.canvas.clientLeft, this.canvas.clientTop, this.canvas.clientLeft + this.canvas.width, this.canvas.clientTop + this.canvas.height, "LightBlue");
    // draw circle:
    DrawArc(ctx, pie_CenterX, pie_CenterY, pie_Radius + 1.8, 0, 2 * Math.PI, color);
                };

                this.PieLabels = function (labelColor, percent) {
                    for (slice in this.options.label) {
                        if (percent)
                            label = this.options.value[slice] + "%";
                        else
                            label = this.options.label[slice];
                        DrawLabel(                          // clear
                            ctx,
                            slice,
                            label,
                            bgColor
                        );
                        DrawLabel(                          // draw
                            ctx,
                            slice,
                            label,
                            labelColor
                        );
                    }
                };

                this.PieFill = function () {
                    for (slice in this.options.value) {
        value = this.options.value[slice];
    color = this.options.color[slice];
                        angle = this.options.angle[slice];
                        var sliceRadius = unit_Radius * value;
                        FillSlice(
                            ctx,
                            pie_CenterX,
                            pie_CenterY,
                            sliceRadius,
                            DegreeToRadian(angle),
                            DegreeToRadian(angle + sweep_Angle),
                            color
                        );
                        DrawSlice(
                            ctx,
                            pie_CenterX,
                            pie_CenterY,
                            sliceRadius,
                            DegreeToRadian(angle),
                            DegreeToRadian(angle + sweep_Angle),
                            bgColor,     // color
                            1
                        );
                    }
                };

                this.PieOutline = function (outColor) {
                    for (slice in this.options.value) {
        value = this.options.value[slice];
    //color = this.options.color[slice];
    angle = this.options.angle[slice];
                        var sliceRadius = unit_Radius * value;
                        DrawSlice(
                            ctx,
                            pie_CenterX,
                            pie_CenterY,
                            sliceRadius,
                            DegreeToRadian(angle),
                            DegreeToRadian(angle + sweep_Angle),
                            outColor,
                            2
                        );
                    }
                };

                this.PieClear = function () {
                    for (slice in this.options.value) {
        angle = this.options.angle[slice];
    FillSlice(
                            ctx,
                            pie_CenterX,
                            pie_CenterY,
                            pie_Radius,
                            DegreeToRadian(angle),
                            DegreeToRadian(angle + sweep_Angle),
                            bgColor
                        );
                        DrawSlice(
                            ctx,
                            pie_CenterX,
                            pie_CenterY,
                            pie_Radius,
                            DegreeToRadian(angle),
                            DegreeToRadian(angle + sweep_Angle),
                            bgColor,
                            2
                        );
                    }
                };
            };

            //  =============================================
            //  =======================================  MAIN
            //  =============================================

            var myPie = new Pie({
        canvas: rodaCanvas,
                value: myValues,
                color: myColors,
                label: myLabels,
                angle: myAngles
            });
            myPie.ClearBackground();
            myPie.DrawBackground(outlineColor);
            myPie.PieLabels(labelColor, false);

            //verificar e-mail
            //emailVerificar();
            myPie.PieFill();

            // =========================================  BUTTONS CLICS

            function funcaoSalvar() {
        sendReturnMessage(montarString());
    }
            function funcaoClearAll() {
        myPie.ClearBackground();
    }

            function funcaoDrawBackground() {
        myPie.DrawBackground(bgColor);          // clear
    myPie.DrawBackground(outlineColor);     // draw
            }

            function funcaoShowLabels() {
        myPie.PieLabels(labelColor, false);     // draw
    }

            function funcaoClearLabels() {
        myPie.PieLabels(bgColor, false);        // clear
    }

            function funcaoRandomPie() {
                for (s = pie_Slices - 1; s >= 0; s--) {
        slice = "slice" + s;
    myValues[slice] = RandomValue(45, 95);  // random values
                }
                myPie = new Pie({
        canvas: rodaCanvas,
                    value: myValues,
                    color: myColors,
                    label: myLabels,
                    angle: myAngles
                });
                myPie.PieClear();
                myPie.PieFill();
                myPie.PieLabels(labelColor, false);
            }

            function funcaoClearPie() {
        myPie.PieClear();                   // clear
    }

            function funcaoOutlinePie() {
        myPie.PieClear();                   // clear
    myPie.PieOutline(outlineColor);     // draw
            }

            function funcaoFullPie() {
                for (s = pie_Slices - 1; s >= 0; s--) {
        slice = "slice" + s;
    myValues[slice] = 100;              // 100 % values
                }
                myPie = new Pie({
        canvas: rodaCanvas,
                    value: myValues,
                    color: myColors,
                    label: myLabels,
                    angle: myAngles
                });
                myPie.PieClear();
                myPie.PieFill();
                myPie.PieLabels(labelColor, false);
            }

            function funcaoHalfPie() {
                for (s = pie_Slices - 1; s >= 0; s--) {
        slice = "slice" + s;
    myValues[slice] = 50;              // 50 % values
                }
                myPie = new Pie({
        canvas: rodaCanvas,
                    value: myValues,
                    color: myColors,
                    label: myLabels,
                    angle: myAngles
                });
                myPie.PieClear();
                myPie.PieFill();
                myPie.PieLabels(labelColor, false);
            }

            function funcaoFlipFlopPie() {
                for (s = pie_Slices - 1; s >= 0; s--) {
        slice = "slice" + s;
    if (s % 2 === 0) myValues[slice] = 95;  // 45% ~ 95% values
                    else myValues[slice] = 45;
                }
                myPie = new Pie({
        canvas: rodaCanvas,
                    value: myValues,
                    color: myColors,
                    label: myLabels,
                    angle: myAngles
                });
                myPie.PieClear();
                myPie.PieFill();
                myPie.PieLabels(labelColor, false);
            }

            function funcaoShowPerc() {
                if (!rotating)
                    myPie.PieLabels(labelColor, true);      // draw
            }

            function funcaoRotatePie() {
                if (!rotating) {
        // -------
        // backup:
        // -------
        PieBackup();

    rotating = true;

                    var RotatePie = window.setInterval(function () {
                        // -------------------------------------
                        // Rotate values & colors of all slices:
                        // -------------------------------------
                        var slice1 = "";
                        var slice = "";
                        var s = 0;
                        slice = "slice" + (pie_Slices - 1);
                        var valueExtra = myValues[slice];
                        var colorExtra = myColors[slice];
                        for (s = pie_Slices - 1; s > 0; s--) {
        slice = "slice" + s;
    slice1 = "slice" + (s - 1);
                            myValues[slice] = myValues[slice1];
                            myColors[slice] = myColors[slice1];
                        }
                        slice = "slice0";
                        myValues[slice] = valueExtra;
                        myColors[slice] = colorExtra;
                        myPie = new Pie(
                            {
        canvas: rodaCanvas,
                                value: myValues,
                                color: myColors,
                                label: myLabels,
                                angle: myAngles
                            }
                        );

                        myPie.PieClear();
                        myPie.PieFill();
                    }, 85);

                    id = window.setTimeout(function () {
        clearInterval(RotatePie);

    // --------
    // restore:
    // --------
    PieRestore();
                        myPie = new Pie({
        canvas: rodaCanvas,
                            value: myValues,
                            color: myColors,
                            label: myLabels,
                            angle: myAngles
                        });
                        myPie.PieClear();
                        myPie.PieFill();

                        rotating = false;
                    }, 4250);
                }
            }

            // =========================================  MOUSE MOVE / CLICK:

            function funcaoMouseMove(e) {
                //if(!encerrado)
                //{
                    if (moving)
                        ResizeSlice(e.clientX, e.clientY);
                    else
                        MouseOnSlice(e.clientX, e.clientY);
                //}
            }

            function funcaoMouseDown(e) {
                if (e.button === 0) {
        ResizeSlice(e.clientX, e.clientY);
    }
            }

            function funcaoMouseUp(e) {
                if (moving) {
        myPie.PieLabels(labelColor, false);     // draw

    // Cnacel resize:
    primeSlice = -1;
                    primeValue = -1;
                    primeRadius = -1;
                    moving = false;
                }
            }

            function funcaoMouseOut() {
                if (moving) {
        myPie.PieLabels(labelColor, false);     // draw

    // Cnacel resize:
    primeSlice = -1;
                    primeValue = -1;
                    primeRadius = -1;
                    moving = false;
                }
            }

            function montarString()
            {
                var str="";
                for (i = 0; i<pie_Slices; i++) {
        str += myValues["slice" + i] + "|"
    }
    //console.log("str=" + str);

    //adiciona soma no banco de dados
    //email, nome, dados, obs
    //wix-data

    return str;
            }





            // ==========================================================================================   END SCRIPT
 </script>
d3.csv("data/data.csv").then(function(data) {
  // Chuẩn hóa dữ liệu
  data.forEach(d => {
    d.SL = +d["SL"];
    d.ThanhTien = +d["Thành tiền"];
    let date = new Date(d["Thời gian tạo đơn"]);
    d.Ngay = d3.timeDay(date);   // gom theo ngày
    d.Gio = date.getHours();
    d.Khung_gio = String(d.Gio).padStart(2,"0") + ":00-" + String(d.Gio).padStart(2,"0") + ":59";
  });

  // Tổng theo ngày + khung giờ
  let dailyHour = d3.rollup(
    data,
    v => ({
      TongDoanhThu: d3.sum(v, d => d.ThanhTien),
      TongSKU: d3.sum(v, d => d.SL)
    }),
    d => d.Ngay,
    d => d.Khung_gio
  );

  let dailyArr = [];
  dailyHour.forEach((byHour, ngay) => {
    byHour.forEach((val, khung) => {
      dailyArr.push({
        Ngay: ngay,
        Khung_gio: khung,
        TongDoanhThu: val.TongDoanhThu,
        TongSKU: val.TongSKU
      });
    });
  });

  // Trung bình theo khung giờ
  let groupedMap = d3.rollup(
    dailyArr,
    v => ({
      DoanhThuTB: d3.mean(v, d => d.TongDoanhThu),
      SKU_TB: d3.mean(v, d => d.SL)
    }),
    d => d.Khung_gio
  );

  let grouped = [];
  groupedMap.forEach((val, khung) => {
    grouped.push({
      Khung_gio: khung,
      DoanhThuTB: val.DoanhThuTB,
      SKU_TB: val.SKU_TB,
      GioInt: parseInt(khung.slice(0,2))
    });
  });

  grouped.sort((a,b) => d3.ascending(a.GioInt, b.GioInt));

  // Thiết lập khung vẽ
  const svg = d3.select("#chart6"),
        margin = {top: 40, right: 50, bottom: 100, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
              .domain(grouped.map(d => d.Khung_gio))
              .range([0, width])
              .padding(0.2);

  const y = d3.scaleLinear()
              .domain([0, 950000])
              
              .range([height, 0]);

  // 🎨 12 màu từ bảng bạn đưa
  const customColors = [
    "#264D59", "#43978D", "#F9E07F", "#F9AD6A", "#D46C4E",
    "#5AA7A7", "#96D7C6", "#BAC94A", "#E2D36B", "#6C8CBF",
    "#FF7B89", "#8A5082"
  ];
  const color = d3.scaleOrdinal()
                  .domain(grouped.map(d => d.Khung_gio))
                  .range(customColors);

  // Trục X
  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x))
   .selectAll("text")
     .attr("transform", "rotate(45)")
     .style("text-anchor", "start")
     .style("font-size", "12px")
     .style("font-weight", "bold");

  // Trục Y
  g.append("g")
   .call(d3.axisLeft(y).tickFormat(d => {
     if (d >= 1e6) return (d/1e6).toFixed(0) + "M";
     else return (d/1e3).toFixed(0) + "K";
   }))
   .selectAll("text")
   .style("font-size", "12px")
   .style("font-weight", "bold");

  // Vẽ cột
  g.selectAll("rect")
    .data(grouped)
    .enter().append("rect")
      .attr("x", d => x(d.Khung_gio))
      .attr("y", d => y(d.DoanhThuTB))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.DoanhThuTB))
      .attr("fill", d => color(d.Khung_gio))
      .append("title")
        .text(d => `${d.Khung_gio}\nDoanh thu TB: ${d3.format(",.0f")(d.DoanhThuTB)} VND\nSKU TB: ${Math.round(d.SKU_TB)}`);

  // Nhãn trên cột
  g.selectAll("text.value")
    .data(grouped)
    .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x(d.Khung_gio) + x.bandwidth()/2)
      .attr("y", d => y(d.DoanhThuTB) - 5)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "13px")
      .text(d => d.DoanhThuTB >= 1e6 ? (d.DoanhThuTB/1e6).toFixed(1)+"M" : (d.DoanhThuTB/1e3).toFixed(0)+"K");


});

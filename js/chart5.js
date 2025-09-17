d3.csv("data/data.csv").then(function(data) {
  // Ép kiểu dữ liệu
  data.forEach(d => {
    d.SL = +d["SL"];
    d.ThanhTien = +d["Thành tiền"];
    d.Ngay = new Date(d["Thời gian tạo đơn"]);
    d.NgayTrongThang = d.Ngay.getDate();
  });

  // --- B1: Tổng doanh thu & SKU theo từng ngày ---
  let daily = d3.rollup(
    data,
    v => ({
      TongDoanhThu: d3.sum(v, d => d.ThanhTien),
      TongSKU: d3.sum(v, d => d.SL)
    }),
    d => d.Ngay.toDateString()
  );

  let dailyArr = [];
  daily.forEach((val, key) => {
    let ngay = new Date(key);
    dailyArr.push({
      Ngay: ngay,
      NgayTrongThang: ngay.getDate(),
      TongDoanhThu: val.TongDoanhThu,
      TongSKU: val.TongSKU
    });
  });

  // --- B2: Trung bình theo ngày trong tháng ---
  let groupedMap = d3.rollup(
    dailyArr,
    v => ({
      DoanhThuTB: d3.mean(v, d => d.TongDoanhThu),
      SKUTB: d3.mean(v, d => d.TongSKU)
    }),
    d => d.NgayTrongThang
  );

  let grouped = [];
  groupedMap.forEach((val, day) => {
    grouped.push({
      Ngay: day,
      DoanhThuTB: val.DoanhThuTB,
      SKUTB: val.SKUTB,
      HienThi: "Ngày " + day
    });
  });

  // Sắp xếp 1 -> 31
  grouped.sort((a, b) => d3.ascending(a.Ngay, b.Ngay));

  // --- B3: Vẽ biểu đồ ---
  const svg = d3.select("#chart5"),
        margin = {top: 40, right: 50, bottom: 100, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
              .domain(grouped.map(d => d.HienThi))
              .range([0, width])
              .padding(0.2);

  const y = d3.scaleLinear()
              .domain([0, d3.max(grouped, d => d.DoanhThuTB)])
              .nice()
              .range([height, 0]);

  // 🎨 Màu cố định 12 màu từ ảnh
  const colors = [
    "#264D59", "#43978D", "#F9E07F", "#F9AD6A", "#D46C4E",
    "#5AA7A7", "#96D7C6", "#BAC94A", "#E2D36B", "#6C8CBF",
    "#FF7B89", "#8A5082"
  ];
  const color = d3.scaleOrdinal()
                  .domain(grouped.map(d => d.Ngay))
                  .range(colors);

  // --- Trục X ---
  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x))
   .selectAll("text")
     .attr("transform", "rotate(45)")
     .style("text-anchor", "start")
     .style("font-size", "12px")
     .style("font-weight", "bold");

  // --- Trục Y ---
  g.append("g")
   .call(d3.axisLeft(y).tickFormat(d => (d/1e6).toFixed(0) + "M"))
   .selectAll("text")
   .style("font-size", "12px")
   .style("font-weight", "bold");

  // --- Vẽ cột ---
  g.selectAll("rect")
    .data(grouped)
    .enter().append("rect")
      .attr("x", d => x(d.HienThi))
      .attr("y", d => y(d.DoanhThuTB))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.DoanhThuTB))
      .attr("fill", d => color(d.Ngay))
      .append("title")
        .text(d => `${d.HienThi}\nDoanh thu TB: ${d3.format(",.0f")(d.DoanhThuTB)} VND\nSKU TB: ${Math.round(d.SKUTB)}`);

  // --- Nhãn trên cột ---
  g.selectAll("text.value")
    .data(grouped)
    .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x(d.HienThi) + x.bandwidth() / 2)
      .attr("y", d => y(d.DoanhThuTB) - 5)
      .attr("text-anchor", "middle")
      .text(d => (d.DoanhThuTB / 1e6).toFixed(1) + "M")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#333");


});

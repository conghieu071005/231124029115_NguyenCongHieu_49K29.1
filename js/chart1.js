d3.csv("data/data.csv").then(function(data) {
  // Chuẩn hóa dữ liệu
  data.forEach(d => {
    d.SL = +d["SL"];
    d.DonGia = +d["Đơn giá"];
    d.DoanhThu = d.SL * d.DonGia;
  });

  // Gom nhóm theo Mã nhóm hàng + Mã mặt hàng + Tên mặt hàng
  let groupedMap = d3.group(data, d => d["Mã nhóm hàng"], d => d["Mã mặt hàng"], d => d["Tên mặt hàng"]);
  let grouped = [];

  groupedMap.forEach((byMaMH, maNhom) => {
    byMaMH.forEach((byTen, ma) => {
      byTen.forEach((val, ten) => {
        grouped.push({
          Nhom: maNhom,
          Ma: ma,
          Ten: ten,
          SL: d3.sum(val, d => d.SL),
          DoanhThu: d3.sum(val, d => d.DoanhThu),
          HienThi: `[${ma}] ${ten}`
        });
      });
    });
  });

  // Sắp xếp giảm dần theo DoanhThu
  grouped.sort((a, b) => d3.descending(a.DoanhThu, b.DoanhThu));

  // Thiết lập khung vẽ
  const svg = d3.select("#chart1"),
        margin = {top: 40, right: 100, bottom: 30, left: 250},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
              .domain([0, d3.max(grouped, d => d.DoanhThu)])
              .range([0, width]);

  const y = d3.scaleBand()
              .domain(grouped.map(d => d.HienThi))
              .range([0, height])
              .padding(0.2);

  // 🔹 Tạo gradient cho từng Nhóm hàng
  const defs = svg.append("defs");

  const gradients = {
    "BOT": ["#264D59", "#264D59"],   // Bột
    "SET": ["#43978D", "#43978D"],   // Set trà
    "THO": ["#F9E07F", "#F9E07F"],   // Trà hoa
    "TTC": ["#F9AD6A", "#F9AD6A"],   // Trà củ, quả sấy
    "TMX": ["#D46C4E", "#D46C4E"]    // Trà mix
  };

  Object.entries(gradients).forEach(([key, [c1, c2]]) => {
    const grad = defs.append("linearGradient")
      .attr("id", `grad-${key}`)
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", c1);
    grad.append("stop").attr("offset", "100%").attr("stop-color", c2);
  });

  // Trục X
  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x).tickFormat(d => (d/1e6).toFixed(0) + "M"))
   .selectAll("text")
   .style("font-size", "15px")
   .style("font-weight", "bold");

  // Trục Y
  g.append("g").call(d3.axisLeft(y))
  .call(d3.axisLeft(y))
  .selectAll("text")
  .style("font-size", "13px")
  .style("font-weight", "bold");

  // Vẽ cột (dùng gradient theo nhóm)
  g.selectAll("rect")
    .data(grouped)
    .enter().append("rect")
      .attr("y", d => y(d.HienThi))
      .attr("width", d => x(d.DoanhThu))
      .attr("height", y.bandwidth())
      .attr("fill", d => `url(#grad-${d.Nhom})`)   // 🔥 Gradient fill
      .append("title") // Tooltip
        .text(d => `${d.HienThi}\nDoanh thu: ${d3.format(",")(d.DoanhThu)} VND\nSL: ${d3.format(",")(d.SL)}`);

  // Chú thích text trên cột
  g.selectAll("text.value")
    .data(grouped)
    .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x(d.DoanhThu) + 5)
      .attr("y", d => y(d.HienThi) + y.bandwidth()/2 + 5)
      .text(d => (d.DoanhThu/1e6).toFixed(1) + "M")
      .style("font-size", "12px")
      .style("fill", "#333")
      .style("font-weight", "bold");


});

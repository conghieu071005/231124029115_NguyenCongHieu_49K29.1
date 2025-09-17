d3.csv("data/data.csv").then(function(data) {
  // Chuẩn hóa dữ liệu
  data.forEach(d => {
    d.SL = +d["SL"];
    d.DonGia = +d["Đơn giá"];
    d.DoanhThu = d.SL * d.DonGia;
  });

  // Gom nhóm theo Mã nhóm hàng + Tên nhóm hàng
  let groupedMap = d3.group(data, d => d["Mã nhóm hàng"], d => d["Tên nhóm hàng"]);
  let grouped = [];

  groupedMap.forEach((byTen, maNhom) => {
    byTen.forEach((val, tenNhom) => {
      grouped.push({
        Nhom: maNhom,
        Ten: tenNhom,
        SL: d3.sum(val, d => d.SL),
        DoanhThu: d3.sum(val, d => d.DoanhThu),
        HienThi: `[${maNhom}] ${tenNhom}`
      });
    });
  });

  // Sắp xếp giảm dần theo DoanhThu
  grouped.sort((a, b) => d3.descending(a.DoanhThu, b.DoanhThu));

  // Thiết lập khung vẽ
  const svg = d3.select("#chart2"),
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

  // 🎨 Màu cố định theo nhóm
  const gradients = {
    "BOT": ["#264D59", "#264D59"],
    "SET": ["#43978D", "#43978D"],
    "THO": ["#D46C4E", "#D46C4E"],
    "TTC": ["#F9AD6A", "#F9AD6A"],
    "TMX": ["#F9E07F", "#F9E07F"]
  };

  const color = d3.scaleOrdinal()
                  .domain(Object.keys(gradients))
                  .range(Object.values(gradients).map(g => g[0]));

  // ✅ Trục X (in đậm)
  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x).tickFormat(d => {
     if (d >= 1e9) return (d / 1e9).toFixed(1) + "B";
     return (d / 1e6).toFixed(0) + "M";
   }))
   .selectAll("text")
   .style("font-weight", "bold")
   .style("font-size", "15px");

  // ✅ Trục Y (in đậm + tăng size)
  g.append("g")
   .call(d3.axisLeft(y))
   .selectAll("text")
   .style("font-size", "15px")
   .style("font-weight", "bold");

  // Vẽ cột
  g.selectAll("rect")
    .data(grouped)
    .enter().append("rect")
      .attr("y", d => y(d.HienThi))
      .attr("width", d => x(d.DoanhThu))
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.Nhom))
      .append("title")
        .text(d => `${d.HienThi}\nDoanh thu: ${d3.format(",")(d.DoanhThu)} VND`);

  // ✅ Chú thích text trên cột (in đậm)
  g.selectAll("text.value")
    .data(grouped)
    .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x(d.DoanhThu) + 5)
      .attr("y", d => y(d.HienThi) + y.bandwidth()/2 + 5)
      .text(d => {
        if (d.DoanhThu >= 1e9) return (d.DoanhThu / 1e9).toFixed(1) + "B";
        return (d.DoanhThu / 1e6).toFixed(1) + "M";
      })
      .style("font-size", "13px")
      .style("fill", "#333")
      .style("font-weight", "bold");


});

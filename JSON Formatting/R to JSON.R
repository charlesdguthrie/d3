
u=read.table("~/Documents/UTS Evaluation/brq_v_uts.txt", header=TRUE, sep="\t")
v=as.data.frame(t(u))
w=toJSON(v)
write(w,file="~/Documents/Git/d3/data/brq.JSON")
#build_tree.R
library(rjson)


u=read.table("~/Documents/Git/Partition Tree/changes_charlie", sep="\t")
names(u)=c("hit_date","entity","spend_descr","field","old_new", "freq")
u$hit_date=paste("v",u$hit_date, sep="")
#u$hit_date=sub('-','.',u$hit_date)
#u$hit_date=sub('-','.',u$hit_date)


#Create hit_date.list
hit_dates=as.character(unique(u$hit_date))
hit_date.list=list()
for(i in 1:length(hit_dates))
{
	#Create entity.list
	u.hit_date=u[u$hit_date==hit_dates[i],]
	entities=as.character(unique(u.hit_date$entity))
	entity.list=list()
	for(j in 1:length(entities))
	{
		#Create spend_descr.list
		u.entity=u.hit_date[u.hit_date$entity==entities[j],]
		spend_descrs=as.character(unique(u.entity$spend_descr))
		spend_descr.list=list()
		
		#REDUCING LOAD FOR TESTING
		for(k in 1:length(spend_descrs))
		{
			#Create field.list
			u.spend_descr=u.entity[u.entity$spend_descr==spend_descrs[k],]
			fields=as.character(unique(u.spend_descr$field))
			field.list=list()
			for(l in 1:length(fields))
			{
				#Create old_new.list
				u.field=u.spend_descr[u.spend_descr$field==fields[l],]
				old_news=as.character(unique(u.field$old_new))
				old_new.list=list()
				for(m in 1:length(old_news))
				{
					
					#REDUCING LOAD FOR TESTING
					#Create freq.list
					freqs=u.field$freq[u.field$old_new==old_news[m]]
					#freq.list=list()
					#for(n in 1:length(freqs))
					#{
					#	freq.list[[n]]=list(name=freqs[n], size=freqs[n])
					#}
					old_new.list[[m]]=list(name=old_news[m], size=sum(freqs))
				}	
				field.list[[l]]=list(name=fields[l], children=old_new.list)
			}
			spend_descr.list[[k]]=list(name=spend_descrs[k], children=field.list)
		}
		entity.list[[j]]=list(name=entities[j], children=spend_descr.list)
	}
	hit_date.list[[i]]=list(name=hit_dates[i], children=entity.list)
}
wrapper=list(name="log",children=hit_date.list)
json<-toJSON(wrapper)
write(json, file="~/Documents/git/d3/Partition Tree/partition_tree.JSON")

list_items=function(dat,column,i){
	if(column==ncol(dat)){
		col.list[[i]]=list(name=uniques[i], size=dat[i,column])
	} else {
		uniques=as.character(unique(dat[u$spend_descr==spend_descrs[k],column]))
	}
}
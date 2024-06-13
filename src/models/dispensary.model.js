var db = require("../../config/db.config");
require("../common/common")();
const environment = require("../environments/environment");
const { executeQuery } = require("../helpers/utils");

var Dispensary = function (dispensaries) {
  this.name = dispensaries.name;
  this.email = dispensaries.email;
  this.slug = dispensaries.slug;
  this.image = dispensaries?.image;
  this.country = dispensaries?.country;
  this.city = dispensaries?.city;
  this.state = dispensaries?.state;
  this.zip = dispensaries?.zip;
  this.address = dispensaries?.address;
  this.phone = dispensaries?.phone;
};

Dispensary.findDispensary = async function (
  selectedState,
  selectedCountry,
  zipCode,
  dispensaryName,
  limit,
  offset
) {
  let whereCondition = "";
  if (selectedCountry) {
    whereCondition = `d.country = '${selectedCountry}' ${
      selectedState ? `AND d.state = '${selectedState}'` : ""
    }`;
    if (zipCode) {
      whereCondition += ` AND d.zip = '${zipCode}'`;
    }
    if (dispensaryName) {
      whereCondition += ` AND d.name = '${dispensaryName}'`;
    }
  }

  let query = "";
  query = `select d.* from dispensaries as d  ${
    whereCondition ? `where ${whereCondition}` : ""
  } limit ${limit} offset ${offset};`;
  console.log("query===>", query);
  const dispensaryList = await executeQuery(query);
  return dispensaryList;
};

Dispensary.findCommunityById = async function (id) {
  const query1 =
    "select c.*,p.Username,count(cm.profileId) as members from community as c left join profile as p on p.ID = c.profileId left join communityMembers as cm on cm.communityId = c.Id where c.Id=?;";
  const query2 =
    "select cm.*,p.Username, p.ProfilePicName,p.FirstName,p.LastName,p.Zip,p.Country,p.State,p.City,p.MobileNo,p.CoverPicName,u.Email,p.UserID from communityMembers as cm left join profile as p on p.ID = cm.profileId left join users as u on u.Id = p.UserID  where cm.communityId = ?;";
  const values = [id];
  const community = await executeQuery(query1, values);
  const members = await executeQuery(query2, values);
  community.map((e) => {
    e.memberList = members;
    return e;
  });
  return community;
};

Dispensary.findCommunityBySlug = async function (slug) {
  const communityQuery =
    "select c.*,p.Username, count(cm.profileId) as members from community as c left join profile as p on p.ID = c.profileId left join communityMembers as cm on cm.communityId = c.Id where c.slug=?";
  const communities = await executeQuery(communityQuery, [slug]);
  const community = communities?.[0] || {};

  if (community?.Id) {
    const getMembersQuery =
      "select cm.*,p.Username, p.ProfilePicName,p.FirstName,p.LastName from communityMembers as cm left join profile as p on p.ID = cm.profileId where cm.communityId = ?;";
    const members = await executeQuery(getMembersQuery, [community?.Id]);
    community["memberList"] = members;
  }

  return community;
};

module.exports = Dispensary;

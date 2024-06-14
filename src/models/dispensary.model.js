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
  this.profileId = dispensaries?.profileId;
};

Dispensary.findDispensary = async function (
  selectedState,
  selectedCountry,
  zipCode,
  dispensaryName,
  limit,
  offset
) {
  let whereCondition = "d.isApprove = 'Y'";
  if (selectedCountry) {
    whereCondition = ` AND d.country = '${selectedCountry}'`;
  }
  if (selectedState) {
    whereCondition += ` AND d.state = '${selectedState}'`;
  }

  if (zipCode) {
    whereCondition += ` AND d.zip = '${zipCode}'`;
  }
  if (dispensaryName) {
    whereCondition += ` AND d.name LIKE '%${dispensaryName}%'`;
  }

  let query = "";
  query = `select d.* from dispensaries as d where ${whereCondition} limit ${limit} offset ${offset};`;
  console.log("query===>", query);
  const dispensaryList = await executeQuery(query);
  return dispensaryList;
};

Dispensary.create = async function (dispensaryData, result) {
  let communityId = null;
  db.query(
    "INSERT INTO dispensaries set ?",
    dispensaryData,
    function (err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res.insertId);
      }
    }
  );

  // const query = communityData.Id
  //   ? '"update community set ? where Id = ?'
  //   : '"INSERT INTO community set ?';
  // const values = communityData.Id
  //   ? [communityData, communityData.Id]
  //   : { communityData };
  // const community = await executeQuery(query, values);
  // return community;
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

Dispensary.getCommunities = async function (
  limit,
  offset,
  search,
  startDate,
  endDate
) {
  let whereCondition = `${search ? `d.name LIKE '%${search}%'` : ""}`;
  if (startDate && endDate) {
    whereCondition += `${
      search
        ? `AND d.createdDate >= '${startDate}' AND d.createdDate <= '${endDate}'`
        : `d.createdDate >= '${startDate}' AND d.createdDate <= '${endDate}'`
    }`;
    console.log(whereCondition);
  } else if (startDate) {
    whereCondition += `${
      search
        ? `AND d.createdDate >= '${startDate}'`
        : `d.createdDate >= '${startDate}'`
    } `;
  } else if (endDate) {
    whereCondition += `${
      search
        ? `AND d.createdDate >= '${startDate}'`
        : `d.createdDate <= '${endDate}'`
    }`;
  }
  const searchCount = await executeQuery(
    `SELECT count(d.id) as count FROM dispensaries as d ${
      whereCondition ? `WHERE ${whereCondition}` : ""
    } `
  );
  const searchData = await executeQuery(
    `select d.* from dispensaries as d ${
      whereCondition ? `WHERE ${whereCondition}` : ""
    } GROUP BY d.id order by d.createdDate desc limit ? offset ?`,
    [limit, offset]
  );
  return {
    count: searchCount?.[0]?.count || 0,
    data: searchData,
  };
  // db.query(
  //   "select c.*,count(cm.profileId) as members from community as c left join communityMembers as cm on cm.communityId = c.Id where c.isApprove='Y' GROUP BY c.Id order by c.creationDate desc limit ? offset ?",
  //   [limit, offset],
  //   function (err, res) {
  //     if (err) {
  //       result(err, null);
  //     } else {
  //       result(null, res);
  //     }
  //   }
  // );
};

Dispensary.approveCommunity = function (communityId, isApprove, result) {
  db.query(
    "UPDATE dispensaries SET isApprove=? where id=?",
    [isApprove, communityId],
    function (err, res) {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        console.log(res);
        result(null, res);
      }
    }
  );
};

Dispensary.deleteCommunity = function (id, result) {
  db.query("delete from dispensary where id=?", id, function (err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = Dispensary;

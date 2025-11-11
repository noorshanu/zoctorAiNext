import React from "react";


const MobilePhone = () => {
  return (
    <div className="phone-container">
      <div className="screen">
        <div className="earnings">
          <h3>Earnings</h3>
          <p>Total Expense</p>
          <h1>$6078.76</h1>
          <p>Profit is 48% More than last Month</p>
          <div className="progress-circle">
            <span>80%</span>
          </div>
        </div>
        <div className="groups">
          <h4>Groups</h4>
          <div className="group-icons">
            <div className="group-icon">Maggie</div>
            <div className="group-icon">Roommates</div>
            <div className="group-icon">Emily</div>
            <div className="group-icon">Henry</div>
          </div>
          <button className="group-btn">New payment or group</button>
        </div>
        <div className="transactions">
          <p>Fossa Drinks and beverage</p>
          <p>Saturday</p>
        </div>
        <div className="video-container">
          <video controls>
            <source src="/images/mark.mov" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default MobilePhone;

import Joi from 'joi';

const userParams = {
  //POST auth/signUp
  signUp: {
    body: {
      name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string(),
    }
  },

  //POST auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required(),
    }
  },

  //PUT user/updateUser/:userId
  updateUser: {
    params: {
      userId: Joi.string().required()
    },
    body: {
      name: Joi.string(),
      email: Joi.string(),
      profilePicture: Joi.string()
    }
  },

  //POST user/submitQuestion
  submitQuestion: {
    body: {
      topicId: Joi.string().required(),
      questionId: Joi.string().required(),
      submittedAnswer: Joi.array().items(Joi.string()).required(),
      submitDate: Joi.string().required()
    }
  },

  //GET user/getLearningProgress
  getLearningProgress: {
    query: {
      currentDate: Joi.string().required(),
      timePeriod: Joi.string().valid('week', 'month', 'year').required()
    }
  },

  //PUT user/changePassword
  changePassword: {
    body: {
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required()
    }
  },

  //GET user/getDailyStreak
  getDailyStreak: {
    query: {
      currentDate: Joi.string().required()
    }
  },

  //POST user/submitFeedback
  submitFeedback: {
    body: {
      subject: Joi.string().required(),
      message: Joi.string().required()
    }
  },

  //GET user/getLeaderBoardData
  getLeaderBoardData: {
    query: {
      currentDate: Joi.string().required(),
      timePeriod: Joi.string().valid('week', 'month').required()
    }
  },

  //GET user/getHintByQuestion/:questionId
  getHintByQuestion: {
    params: {
      questionId: Joi.string().required()
    }
  },

  //DELETE user/deleteNotification/:notiId
  deleteNotification: {
    params: {
      notiId: Joi.string().required()
    }
  },

  //GET user/getDisscussions
  getDiscussions: {
    query: {
      questionId: Joi.string().required()
    }
  },

  //GET user/getQuestionList
  getQuestionList: {
    query: {
      topicId: Joi.string().required()
    }
  },
}

module.exports = userParams;
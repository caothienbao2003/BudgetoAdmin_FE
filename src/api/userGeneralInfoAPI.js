import api from '../api.js';

const userGeneralInfoApi = {
  getAllUserGeneralInfo: () => api.get('users/general-info/all'),
};

export default userGeneralInfoApi;
